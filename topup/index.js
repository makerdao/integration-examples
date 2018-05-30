require('babel-register')

const topup = require('./src/topup')
module.exports = topup

if (require.main === module) {
  const cli = require('./src/cli')
  cli()
}
