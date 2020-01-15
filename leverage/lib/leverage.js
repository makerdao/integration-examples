const invariant = require('invariant');
const Maker = require('@makerdao/dai');
const Eth2DaiInstant = require('@makerdao/dai-plugin-eth2dai-instant')
const infuraProjectId = 'c3f0f26a4c1742e0949d8eedfc47be67'; //dai.js project id


// descriptive logging
const debug = require('debug');
const log = {
  state: debug('leverage:state'),
  action: debug('leverage:action'),
  title: debug('leverage:header')
};


module.exports = async (iterations, priceFloor, principal) => {
  try {
    // connect to blockchain using infura
    const maker = await Maker.create('http', {
      privateKey: process.env.PRIVATE_KEY,
      plugins: [Eth2DaiInstant],
      log: true,
      url: 'https://kovan.infura.io/v3/11465e3f27b247eb8b785c23047b29fd'
    });
    await maker.authenticate();

    invariant(
      iterations !== undefined &&
      priceFloor !== undefined &&
      principal !== undefined,
<<<<<<< HEAD
      'Not all parameters (iterations, priceFloor, principal) were received'
    );

    log.title('Creating a leveraged cdp with the following parameters:');
    log.title(`Iterations: ${iterations}`);
    log.title(`Price Floor: $${priceFloor}`);
    log.title(`Principal: ${principal} ETH`);


    // await maker.authenticate();
    const liquidationRatio = await maker.service('cdp').getLiquidationRatio();
    const priceEth = (await maker.service('price').getEthPrice()).toNumber();

    // Getting the exchange
    let oasis = await maker.service('exchange');
    console.log('Getting the Exchange: ', oasis)

    log.state(`Liquidation ratio: ${liquidationRatio}`);
    log.state(`Current price of ETH: ${priceEth}`);

    invariant(
      priceEth > priceFloor,
      'Price floor must be below the current oracle price'
    );

    log.action('opening CDP...');
    const cdp = await maker.openCdp();
    const id = await cdp.id;
    log.state(`CDP ID: ${id}`);

    // calculate a collateralization ratio that will achieve the given price floor
    const collatRatio = priceEth * liquidationRatio / priceFloor;
    log.state(`Target ratio: ${collatRatio}`);

    // lock up all of our principal
    await cdp.lockEth(principal);
    log.action(`locked ${principal} ETH`);

    //get initial peth collateral
    const initialPethCollateral = await cdp.getCollateralValue(Maker.PETH);
    log.state(`${principal} ETH is worth ${initialPethCollateral}`);

    // calculate how much Dai we need to draw in order
    // to achieve the desired collateralization ratio
    let drawAmt = Math.floor(principal * priceEth / collatRatio);
    const drawTx = cdp.drawDai(drawAmt);
    await maker.service('transactionManager').confirm(drawTx);
=======
    'Not all parameters (iterations, priceFloor, principal) were received'
  );

  log.title('Creating a leveraged cdp with the following parameters:');
  log.title(`Iterations: ${iterations}`);
  log.title(`Price Floor: $${priceFloor}`);
  log.title(`Principal: ${principal} ETH`);

  await maker.authenticate();
  const liquidationRatio = await maker.service('cdp').getLiquidationRatio();
  const priceEth = (await maker.service('price').getEthPrice()).toNumber();

  log.state(`Liquidation ratio: ${liquidationRatio}`);
  log.state(`Current price of ETH: ${priceEth}`);

  invariant(
    priceEth > priceFloor,
    'Price floor must be below the current oracle price'
  );

  log.action('opening CDP...');
  const cdp = await maker.openCdp();
  const id = await cdp.id;
  log.state(`CDP ID: ${id}`);

  // calculate a collateralization ratio that will achieve the given price floor
  const collatRatio = priceEth * liquidationRatio / priceFloor;
  log.state(`Target ratio: ${collatRatio}`);

  // lock up all of our principal
  await cdp.lockEth(principal);
  log.action(`locked ${principal} ETH`);

  //get initial peth collateral
  const initialPethCollateral = await cdp.getCollateralValue(Maker.PETH);
  log.state(`${principal} ETH is worth ${initialPethCollateral}`);

  // calculate how much Dai we need to draw in order
  // to achieve the desired collateralization ratio
  let drawAmt = Math.floor(principal * priceEth / collatRatio);
  await cdp.drawDai(drawAmt);
  log.action(`drew ${drawAmt} Dai`);

  // do `iterations` round trip(s) to the exchange
  for (let i = 0; i < iterations; i++) {
    // exchange the drawn Dai for W-ETH
    let tx = await maker.service('exchange').sellDai(drawAmt, Maker.WETH);

    // observe the amount of W-ETH received from the exchange
    // by calling `fillAmount` on the returned transaction object
    let returnedWeth = tx.fillAmount();
    log.action(`exchanged ${drawAmt} Dai for ${returnedWeth}`);

    // lock all of the W-ETH we just received into our CDP
    await cdp.lockWeth(returnedWeth);
    log.action(`locked ${returnedWeth}`);

    // calculate how much Dai we need to draw in order to
    // re-attain our desired collateralization ratio
    drawAmt = Math.floor(returnedWeth.toNumber() * priceEth / collatRatio);
    await cdp.drawDai(drawAmt);
>>>>>>> ad5a9a8fff7bf3aca20ed781035491604ed3a866
    log.action(`drew ${drawAmt} Dai`);

    // do `iterations` round trip(s) to the exchange
    for (let i = 0; i < iterations; i++) {
      // exchange the drawn Dai for W-ETH
      let tx = await maker.service('exchange').sellDai(drawAmt, Maker.WETH);

      // observe the amount of W-ETH received from the exchange
      // by calling `fillAmount` on the returned transaction object
      let returnedWeth = tx.fillAmount();
      log.action(`exchanged ${drawAmt} Dai for ${returnedWeth}`);

      // lock all of the W-ETH we just received into our CDP
      await cdp.lockWeth(returnedWeth);
      log.action(`locked ${returnedWeth}`);

      // calculate how much Dai we need to draw in order to
      // re-attain our desired collateralization ratio
      drawAmt = Math.floor(returnedWeth.toNumber() * priceEth / collatRatio);
      await cdp.drawDai(drawAmt);
      log.action(`drew ${drawAmt} Dai`);
    }

    // get the final state of our CDP
    const [pethCollateral, debt] = await Promise.all([
      cdp.getCollateralValue(Maker.PETH),
      cdp.getDebtValue()
    ]);

    const cdpState = {
      initialPethCollateral,
      pethCollateral,
      debt,
      id,
      principal,
      iterations,
      priceFloor,
      finalDai: drawAmt
    };

    log.state(`Created CDP: ${JSON.stringify(cdpState)}`);
    return cdpState;
  }
  catch (error) {
    console.log('ERROR OCCURRED!', error)
  }
};