const minimist = require('minimist')
const leverage = require('./leverage');

const argv = minimist(process.argv);
let i = argv._[argv._.length - 3];
let pf = argv._[argv._.length - 2];
let p = argv._[argv._.length - 1];

leverage(i, pf, p);