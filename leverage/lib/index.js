const http = require("http");
var url = require("url");
const invariant = require("invariant");

const Maker = require("@makerdao/makerdao-exchange-integration");

// descriptive logging
const debug = require("debug");
const log = {
  state: debug("leverage:state"),
  action: debug("leverage:action"),
  title: debug("leverage:header")
};

// connect to kovan using infura
const maker = new Maker("kovan", { privateKey: process.env.KOVAN_PRIVATE_KEY });

const leveragedCDPS = [];

const createLeveragedCDP = async ({ iterations, priceFloor, principal }) => {
  invariant(
    iterations !== undefined &&
      priceFloor !== undefined &&
      principal !== undefined,
    `Not all parameters (iterations, priceFloor, principal) were recieved`
  );

  log.title(`Creating a leveraged cdp with the following parameters:`);
  log.title(`Iterations: ${iterations}`);
  log.title(`Price Floor: $${priceFloor}`);
  log.title(`Principal: ${principal} ETH`);

  // get the liquidation ratio from the "cdp" service
  const liquidationRatio = await maker.service("cdp").getLiquidationRatio();
  log.state(`Liquidation ratio: ${liquidationRatio}`);

  // get the current eth price (according to Maker's price oracle) from the "priceFeed" service
  const priceEth = await maker.service("priceFeed").getEthPrice();
  log.state(`Current price of ETH: ${priceEth}`);

  invariant(
    priceEth > priceFloor,
    `Price floor must be below the current oracle price`
  );

  const cdp = await maker.openCdp();
  const id = await cdp.getCdpId();
  log.action(`opened cdp ${id}`);

  // calculate a collateralization ratio that will achieve the given price floor
  const collatRatio = (priceEth * liquidationRatio) / priceFloor;

  // lock up all of our principal
  await cdp.lockEth(principal);
  log.action(`locked ${principal} ETH`);

  // calculate how much Dai we need to draw in order
  // to achieve the desired collateralization ratio
  let drawAmt = Math.floor((principal * priceEth) / collatRatio);
  await cdp.drawDai(drawAmt.toString());
  log.action(`drew ${drawAmt} Dai`);

  // do `iterations` round trip(s) to the exchange
  for (let i = 0; i < iterations; i++) {
    // exchange the drawn Dai for W-ETH
    let tx = await maker
      .service("exchange")
      .sellDai(drawAmt.toString(), "WETH");

    // observe the amount of W-ETH recieved from the exchange
    // by calling `fillAmount` on the returned transaction object
    let returnedWeth = tx.fillAmount().toString();
    log.action(`exchanged ${drawAmt} Dai for ${returnedWeth} W-ETH`);

    // lock all of the W-ETH we just recieved into our CDP
    await cdp.lockWeth(returnedWeth);
    log.action(`locked ${returnedWeth} ETH`);

    // calculate how much Dai we need to draw in order to
    // re-attain our desired collateralization ratio
    drawAmt = Math.floor((returnedWeth * priceEth) / collatRatio);
    await cdp.drawDai(drawAmt.toString());
    log.action(`drew ${drawAmt} Dai`);
  }

  // get the final state of our CDP
  const pethCollateral = await cdp.getCollateralAmountInPeth();
  const debt = await cdp.getDebtAmount();

  const cdpState = {
    pethCollateral,
    debt,
    id,
    principal,
    iterations,
    priceFloor,
    finalDai: drawAmt
  };

  log.state(`Created CDP: ${JSON.stringify(cdpState)}`);
  leveragedCDPS.push(cdpState);
};

http
  .createServer(async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json " });
    const query = url.parse(req.url, true).query;
    try {
      await createLeveragedCDP(query);
      res.end(JSON.stringify(leveragedCDPS));
    } catch (error) {
      console.log(error);
      res.statusCode = 400;
      res.end(`Problem creating leveraged cdp: ${error}`);
    }
  })
  .listen(1337, "127.0.0.1");

log.state(`server running on port 1337`);
