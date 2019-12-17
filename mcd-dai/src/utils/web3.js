import Maker from '@makerdao/dai';
import McdPlugin, { ETH, BAT } from '@makerdao/dai-plugin-mcd';
import FaucetABI from './Faucet.json';
import dsTokenAbi from './dsToken.abi.json';

let maker = null;
let web3 = null;

const connect = async () => {
    maker = await Maker.create('browser', {
        plugins: [
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



export {
    requestTokens,
    getWeb3,
    connect,
    approveProxyInBAT,
    approveProxyInDai
};