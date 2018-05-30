const minimist = require('minimist')
const topup = require('./topup')

module.exports = async function() {
  const argv = minimist(process.argv)
  const verbose = argv.v || argv.verbose

  const cdpId = argv._[argv._.length - 1]
  if (isNaN(Number(cdpId))) {
    console.error("You must specify a CDP ID as the first argument.")
    process.exit(1)
  }

  async function run() {
    try {
      await topup(cdpId)
    } catch (e) {
      console.error(verbose ? e.stack : e.message)
    }
  }

  const poll = argv.p || argv.poll
  if (poll) {
    const seconds = poll != true ? poll : 5
    if (isNaN(Number(seconds))) {
      console.error("The interval must be a number.")
      process.exit(1)
    }

    console.log(`Checking CDP ${cdpId} every ${seconds} seconds...`)
    setInterval(run, seconds * 1000)
  } else {
    console.log(`Checking CDP ${cdpId}...`)
    await run()
    process.exit()
  }
}
