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
const maker = new Maker('kovan', {privateKey: process.env.KOVAN_PRIVATE_KEY});

const LIQUIDATION_RATIO = 1.5;
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

  // get the current eth price (according to Maker's price oracle) from the "priceFeed" service
  const priceETH = await maker.service("priceFeed").getEthPrice();
  log.state(`Current price of ETH: ${priceETH}`);

  invariant(
    priceETH > priceFloor,
    `Price floor must be below the current oracle price`
  );

  const cdp = await maker.openCdp();
  const id = await cdp.getCdpId();
  log.action(`opened cdp ${id}`);

  // calculate a collateralization ratio that will achieve the given price floor
  const collatRatio = priceETH * LIQUIDATION_RATIO / priceFloor;

  // lock up all of our principal
  await cdp.lockEth(principal);
  log.action(`locked ${principal} ETH`);

  // calculate how much dai to draw in order to achieve the collateralization ratio ^
  let drawAmt = Math.floor(principal * priceETH / collatRatio);
  await cdp.drawDai(drawAmt.toString());
  log.action(`drew ${drawAmt} Dai`);

  // grab our weth token object from the "token service"
  const weth = maker.service("token").getToken("WETH");

  // do `iterations` round trip(s) to the exchange
  for (let i = 0; i < iterations; i++) {
    // exchange drawn dai for W-ETH
    let tx = await maker
      .service("exchange")
      .sellDai(drawAmt.toString(), "WETH");

    // observe the amount recieved from the exchange by calling `fillAmount` on the returned transaction object
    let returnedETH = tx.fillAmount().toString();
    log.action(`exchanged ${drawAmt} Dai for ${returnedETH} W-ETH`);

    // unwrap the eth
    await weth.withdraw(returnedETH);
    log.action(`unwrapped ${returnedETH} W-ETH`);

    // lock all of the eth that we just recieved into our cdp
    await cdp.lockEth(returnedETH);
    log.action(`locked ${returnedETH} ETH`);

    // calculate how much dai we need to draw in order to re-attain our desired collat ratio
    drawAmt = Math.floor(returnedETH * priceETH / collatRatio);
    await cdp.drawDai(drawAmt.toString());
    log.action(`drew ${drawAmt} Dai`);
  }

  // get the final state of our cdp
  const collateral = await cdp.getCollateralAmountInPeth();
  const debt = await cdp.getDebtAmount();

  const cdpState = {
    collateral,
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
