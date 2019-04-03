const Maker = require('@makerdao/dai');
const roundTo = require('round-to');
const infuraProjectId = 'c3f0f26a4c1742e0949d8eedfc47be67'; //dai.js project id

const MIN_ADD_AMOUNT = 0.0001;
const ROUND_TO_PLACES = 4;

module.exports = async function(cdpId, options) {
  let targetRatio;
  try {
    targetRatio = Maker.USD_DAI(options.targetRatio);
  } catch (err) {
    throw new Error(`Invalid value for targetRatio: ${err}`);
  }

  const maker = Maker.create(process.env.NETWORK, {
    privateKey: process.env.PRIVATE_KEY,
    log: false,
    provider: {
      infuraProjectId
    }
  });
  const cdp = await maker.getCdp(cdpId);

  const collateral = await cdp.getCollateralValue();
  console.log(`collateral: ${collateral}`);

  const debt = await cdp.getDebtValue(Maker.USD);
  console.log(`debt: ${debt}`);

  const collateralPrice = await maker.service('price').getEthPrice();
  console.log(`price: ${collateralPrice}`);

  const ratio = await cdp.getCollateralizationRatio();
  if (targetRatio.gt(ratio)) {
    let addAmount = debt
      .times(targetRatio)
      .minus(collateral.times(collateralPrice))
      .div(collateralPrice)
      .toNumber();

    if (addAmount < MIN_ADD_AMOUNT) {
      addAmount = MIN_ADD_AMOUNT;
    } else {
      addAmount = roundTo.up(addAmount, ROUND_TO_PLACES);
    }

    console.log(`ratio is ${ratio}; adding ${addAmount} ETH.`);
    await cdp.lockEth(addAmount);
  } else {
    console.log(`ratio is ${ratio}; doing nothing.`);
  }

  // optional: remove collateral if it's too high

  return [targetRatio, collateral, debt, collateralPrice, ratio];
};
