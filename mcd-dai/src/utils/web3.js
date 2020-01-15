import Maker from '@makerdao/dai';
import McdPlugin, { ETH, BAT } from '@makerdao/dai-plugin-mcd';
import FaucetABI from './Faucet.json';
import dsTokenAbi from './dsToken.abi.json';
import MakerOtc from '@makerdao/dai-plugin-eth2dai-instant';
import debug from 'debug';

let maker = null;
let web3 = null;

const connect = async () => {
    maker = await Maker.create('browser', {
        plugins: [MakerOtc,
            [
                McdPlugin,
                {
                    network: 'kovan',
                    cdpTypes: [
                        { currency: ETH, ilk: 'ETH-A' },
                        { currency: BAT, ilk: 'BAT-A' },
                    ]
                }
            ]
        ]
    });
    await maker.authenticate();
    await maker.service('proxy').ensureProxy();
    let exchange = await maker.service('exchange')
    console.log('exchange service: ', exchange)
    return maker;
}


const getWeb3 = async () => {
    web3 = await maker.service('web3')._web3;
    return web3;
}

const requestTokens = async () => {
    try {
        console.log('trying to call function gulp in faucet')
        let accounts = await web3.eth.getAccounts()
        let BAT = '0x9f8cfb61d3b2af62864408dd703f9c3beb55dff7'
        const faucetABI = FaucetABI;
        const faucetAddress = '0x94598157fcf0715c3bc9b4a35450cce82ac57b20'
        const faucetContract = new web3.eth.Contract(faucetABI, faucetAddress);
        await faucetContract.methods.gulp(BAT).send({ from: accounts[0] }, (error, result) => console.log(error))


    } catch (error) {
        console.log('Request Tokens error', error)
    }
}

const approveProxyInBAT = async () => {
    try {
        let accounts = await web3.eth.getAccounts();
        let proxy = await maker.currentProxy();
        let BATAddress = '0x9f8cfb61d3b2af62864408dd703f9c3beb55dff7'
        const BATAbi = dsTokenAbi;
        const BATContract = new web3.eth.Contract(BATAbi, BATAddress);
        return new Promise(async (resolve, reject) => {
            await BATContract.methods.approve(proxy, '-1').send({ from: accounts[0] }, (error, result) => {
                if (error) {
                    console.log('error in approving BAT token', error)
                    reject(error)
                }
                console.log('result in approving BAT token', result)
                resolve(result)
            })

        })
    } catch (error) {
        console.log(error)
    }

}
const approveProxyInDai = async () => {
    try {
        let accounts = await web3.eth.getAccounts();
        let proxy = await maker.currentProxy();
        let daiAddress = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa';
        const daiAbi = dsTokenAbi;
        const DAIContract = new web3.eth.Contract(daiAbi, daiAddress);
        return new Promise(async (resolve, reject) => {
            await DAIContract.methods.approve(proxy, '-1').send({ from: accounts[0] }, (error, result) => {
                if (error) {
                    console.log('error in approving DAI token', error)
                    reject(error);
                }
                console.log('result in approving DAI token', result)
                resolve(result);
            })

        })
    } catch (error) {
        console.log(error)
    }

}

const log = {
    state: debug('leverage:state'),
    action: debug('leverage:action'),
    title: debug('leverage:header')
};

const leverage = async (iterations = 1, priceFloor = 200, principal = 0.1) => {
    const liquidationRatio = await maker.service('cdp').getLiquidationRatio();
    const priceEth = (await maker.service('price').getEthPrice()).toNumber();

    console.log(`Liquidation ratio: ${liquidationRatio}`);
    console.log(`Current price of ETH: ${priceEth}`);

    console.log('opening CDP...');
    const cdp = await maker.openCdp();
    const id = await cdp.id;
    console.log(`CDP ID: ${id}`);

    // calculate a collateralization ratio that will achieve the given price floor
    const collatRatio = priceEth * liquidationRatio / priceFloor;
    console.log(`Target ratio: ${collatRatio}`);

    // lock up all of our principal
    await cdp.lockEth(principal);
    console.log(`locked ${principal} ETH`);

    //get initial peth collateral
    const initialPethCollateral = await cdp.getCollateralValue(Maker.PETH);
    console.log(`${principal} ETH is worth ${initialPethCollateral}`);

    // calculate how much Dai we need to draw in order
    // to achieve the desired collateralization ratio
    let drawAmt = Math.floor(principal * priceEth / collatRatio);
    await cdp.drawDai(drawAmt);
    console.log(`drew ${drawAmt} Dai`);


    // do `iterations` round trip(s) to the exchange
    for (let i = 0; i < iterations; i++) {
        // exchange the drawn Dai for W-ETH
        let tx = await maker.service('exchange').sell('DAI', 'ETH', drawAmt);

        // observe the amount of W-ETH received from the exchange
        // by calling `fillAmount` on the returned transaction object
        let returnedWeth = tx.fillAmount();
        console.log(`exchanged ${drawAmt} Dai for ${returnedWeth}`);

        // lock all of the W-ETH we just received into our CDP
        await cdp.lockWeth(returnedWeth);
        console.log(`locked ${returnedWeth}`);

        // calculate how much Dai we need to draw in order to
        // re-attain our desired collateralization ratio
        drawAmt = Math.floor(returnedWeth.toNumber() * priceEth / collatRatio);
        await cdp.drawDai(drawAmt);
        console.log(`drew ${drawAmt} Dai`);
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

    console.log(`Created CDP: ${JSON.stringify(cdpState)}`);
}



export {
    requestTokens,
    getWeb3,
    connect,
    approveProxyInBAT,
    approveProxyInDai,
    leverage
};