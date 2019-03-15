const dai = require('./dai')
const wyre = require('./wyre')


async function start() {
    await dai.start(wyreEthereumWallet, amountOfDaiToTransfer, accountPrivateKey);
    wyre.start();
    wyre.exchangeDaiToUsd(amount);
    wyre.exchangeUsdToDai(amount);
}
start();