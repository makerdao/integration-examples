const {
  ConfigFactory,
  Maker
} = require('@makerdao/makerdao-exchange-integration')

module.exports = async function(cdpId, options) {
  const targetRatio = Number(options.targetRatio)
  if (isNaN(targetRatio)) throw new Error("Invalid value for targetRatio")

  // init maker lib
  const config = ConfigFactory.create('decentralized-oasis-without-proxies')
  config.services.log = 'NullLogger'
  const maker = new Maker(config)
  await maker.authenticate()

  // retrieve cdp
  const cdp = await maker.getCdp(cdpId)
  const info = await cdp.getInfo()

  const collateral = await cdp.getCollateralAmount()
  console.log(`collateral: ${collateral} ETH`)

  const debt = await cdp.getDebtAmount()
  console.log(`debt: ${debt} DAI`)

  const collateralPrice = maker._container.service('priceFeed');
  console.log(`ETH/USD: ${collateralPrice}`)

  const ratio = collateralPrice * collateral / debt
  if (ratio < targetRatio) {
    const addAmount =
      (targetRatio * debt - collateralPrice * collateral) / collateralPrice;
    console.log(`ratio is ${ratio}; adding ${addAmount} ETH.`)
    await cdp.lockEth(addAmount.toString())
  } else {
    console.log(`ratio is ${ratio}; doing nothing.`)
  }

  // optional: remove collateral if it's too high
}
