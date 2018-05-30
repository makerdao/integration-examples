const { ConfigFactory, Maker } = require('@makerdao/makerdao-exchange-integration')

module.exports = async function(cdpId, options) {
  // options could include:
  // - target collateralization rate
  // - margin of error (i.e. don't change anything if within X%)

  // init maker lib
  const config = ConfigFactory.create('decentralized-oasis-without-proxies')
  const maker = new Maker(config)
  await maker.authenticate()

  // retrieve cdp
  const cdp = await maker.getCdp(cdpId)
  const info = await cdp.getInfo()
  console.log(info)

  // determine its collateralization ratio
  // add more collateral if it's too low

  // optional: remove collateral if it's too high
}
