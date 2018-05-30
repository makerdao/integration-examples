const http = require("http");
var url = require("url");
const assert = require("assert");
const {
  Maker,
  ConfigFactory
} = require("@makerdao/makerdao-exchange-integration");

const config = ConfigFactory.create("decentralized-oasis-without-proxies");
const maker = new Maker(config);

const FINNEY = "1000000000000000";
const LIQUIDATION_RATIO = 1.5;

const leveragedCDPS = [];

const createLeveragedCDP = async ({ layers, priceFloor, principal }) => {
  console.log(`
creating a leveraged cdp with the following parameters:
layers: ${layers}
priceFloor: ${priceFloor}
principal: ${principal}
  `);

  const cdp = await maker.openCdp();
  const id = await cdp.getCdpId();

  const priceETH = await maker.service("priceFeed").getEthPrice();
  console.log(`current price of ETH: ${priceETH}`);

  assert(priceETH >= priceFloor);

  const collatRatio = priceETH * LIQUIDATION_RATIO / priceFloor;

  await cdp.lockEth(principal);
  console.log(`locked ${principal} ETH`);

  const drawAmt = Math.floor(principal * priceETH / collatRatio);
  await cdp.drawDai(drawAmt.toString());
  console.log(`drew ${drawAmt} Dai`);

  const defaultAccount = maker
    .service("token")
    .get("web3")
    .defaultAccount();
  const dai = maker.service("token").getToken("DAI");
  const weth = maker.service("token").getToken("WETH");

  const balanceDai = await dai.balanceOf(defaultAccount);
  const balanceWeth = await weth.balanceOf(defaultAccount);
  console.log(
    `Account dai balance: ${balanceDai} Account WETH balance: ${balanceWeth}`
  );

  /*

      const wethAddress = weth.address();
      const daiAddress = dai.address();

      await maker.service("exchange").offer(
        1000000000000000000,
        wethAddress,
        400000000000000000000,
        daiAddress
      );

      await maker.service("exchange").sellDai("0.1", "WETH");

      for (let i = 0; i < layers - 1; i++) {
        await maker.service("exchange").sellDai("0.1", "WETH");
        let wethAmount = marketBuy(weth, dai, daiAmount);
        await maker.service("conversionService").convertWethToPeth(
          wethAmount.toString()
        );
        await cdp.lockEth(wethAmount.toString());
        let draw = Math.floor(wethAmount * priceETH / collatRatio);
        await cdp.drawDai(draw.toString());
      }
  */

  const info = await cdp.getInfo();
  const collateral = info.ink.div(FINNEY).toNumber() / 1000;
  const debt = info.art.div(FINNEY).toNumber() / 1000;
  const owner = info.lad;

  leveragedCDPS.push({
    collateral,
    debt,
    owner,
    id,
    principal,
    layers,
    priceFloor
  });
};

http
  .createServer(async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json " });
    const query = url.parse(req.url, true).query;
    assert(
      query.layers !== undefined &&
        query.priceFloor !== undefined &&
        query.principal !== undefined
    );
    await createLeveragedCDP(query);
    res.end(JSON.stringify(leveragedCDPS));
  })
  .listen(1337, "127.0.0.1");

console.log(`server running on port 1337`);
