const {
  ConfigFactory,
  Maker
} = require('@makerdao/makerdao-exchange-integration')
const roundTo = require('round-to')

const MIN_ADD_AMOUNT = 0.0001
const ROUND_TO_PLACES = 4

module.exports = async function(cdpId, options) {
  const targetRatio = Number(options.targetRatio)
  if (isNaN(targetRatio)) throw new Error('Invalid value for targetRatio')

  const config = ConfigFactory.create('decentralized-oasis-without-proxies')
  config.services.log = 'NullLogger'
  const maker = new Maker(config)
  const cdp = await maker.getCdp(cdpId)

  const collateral = await cdp.getCollateralAmount()
  console.log(`collateral: ${collateral} ETH`)

  const debt = await cdp.getDebtAmount()
  console.log(`debt: ${debt} DAI`)

  const collateralPrice = await maker.service('priceFeed').getEthPrice()
  console.log(`ETH/USD: ${collateralPrice}`)

  const ratio = collateralPrice * collateral / debt
  if (ratio < targetRatio) {
    let addAmount =
      (targetRatio * debt - collateralPrice * collateral) / collateralPrice

    if (addAmount < MIN_ADD_AMOUNT) {
      addAmount = MIN_ADD_AMOUNT
    } else {
      addAmount = roundTo.up(addAmount, ROUND_TO_PLACES)
    }

    console.log(`ratio is ${ratio}; adding ${addAmount} ETH.`)
    await cdp.lockEth(addAmount.toString())
  } else {
    console.log(`ratio is ${ratio}; doing nothing.`)
  }

  // optional: remove collateral if it's too high
}
