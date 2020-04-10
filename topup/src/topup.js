const Maker = require('@makerdao/dai');
const McdPlugin = require("@makerdao/dai-plugin-mcd").default;
const ETH = require('@makerdao/dai-plugin-mcd').ETH;
const roundTo = require('round-to');
const infuraProjectId = 'c3f0f26a4c1742e0949d8eedfc47be67'; //dai.js project id

const MIN_ADD_AMOUNT = 0.0001;
const ROUND_TO_PLACES = 4;

module.exports = async function (cdpId, options) {
  let targetRatio;
  try {
    targetRatio = Maker.USD_DAI(options.targetRatio);
  } catch (err) {
    throw new Error(`Invalid value for targetRatio: ${err}`);
  }
  console.log(`Target Ratio: ${targetRatio}`)

  const maker = await Maker.create(process.env.NETWORK, {
    privateKey: process.env.PRIVATE_KEY,
    log: false,
    provider: {
      infuraProjectId
    },
    plugins: [
      [McdPlugin, {
        cdpTypes: [
          { currency: ETH, ilk: 'ETH-A' }
        ]
      }]
    ]
  });
  await maker.service('proxy').ensureProxy();
  const cdpManager = await maker.service('mcd:cdpManager');
  const cdpType = maker.service('mcd:cdpType');

  const cdp = await cdpManager.getCdp(cdpId);

  const collateral = cdp.collateralAmount;
  console.log(`Collateral: ${collateral}`);

  const debt = Maker.USD_DAI(cdp.debtValue);
  console.log(`Debt: ${debt}`);

  const collateralPrice = await cdpType.cdpTypes[0].price
  console.log(`Price: ${collateralPrice}`);

  const ratio = await cdp.collateralizationRatio.toNumber();
  
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

    console.log(`Collateral ratio is ${ratio}; adding ${addAmount} ETH.`);
    await cdpManager.lock(cdpId, 'ETH-A', ETH(addAmount));
  } else {
    console.log(`Collateral ratio is ${ratio}; doing nothing.`);
  }

  // optional: remove collateral if it's too high

  return [targetRatio, collateral, debt, collateralPrice, ratio];
};
