import Maker from '@makerdao/dai';
import McdPlugin, { ETH, COL1 } from '@makerdao/dai-plugin-mcd';
import FaucetABI from './Faucet.json';
import dsTokenAbi from './dsToken.abi.json';
import { BigNumber } from 'ethers/utils';

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
                        { currency: COL1, ilk: 'COL1-A' },
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
    console.log('web3js', web3);
    return web3;
}

const requestTokens = async () => {
    try {
        console.log('trying to call function gulp in faucet')
        let accounts = await web3.eth.getAccounts()
        let col1 = '0xc644e83399f3c0b4011d3dd3c61bc8b1617253e5'
        const faucetABI = FaucetABI;
        const faucetAddress = '0xa402e771a4662dcbe661e839a6e8c294d2ce44cf'
        const faucetContract = new web3.eth.Contract(faucetABI, faucetAddress);
        await faucetContract.methods.gulp(col1).send({ from: accounts[0] }, (error, result) => console.log(error))


    } catch (error) {
        console.log('Request Tokens error', error)
    }
}

const approveProxyInCOl1 = async () => {
    try {
        let accounts = await web3.eth.getAccounts();
        let proxy = await maker.currentProxy();
        let col1Address = '0xc644e83399f3c0b4011d3dd3c61bc8b1617253e5'
        const col1Abi = dsTokenAbi;
        const col1Contract = new web3.eth.Contract(col1Abi, col1Address);
        return new Promise(async (resolve, reject) => {
            await col1Contract.methods.approve(proxy, 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').send({ from: accounts[0] }, (error, result) => {
                if (error) {
                    console.log('error in approving col1 token', error)
                    reject(error)
                }
                console.log('result in approving col1 token', result)
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
        let daiAddress = '0xA2e9a6Ed3835746AADBaD195d32d6442b2D7335a';
        const daiAbi = dsTokenAbi;
        const col1Contract = new web3.eth.Contract(daiAbi, daiAddress);
        return new Promise (async (resolve, reject) => {
            await col1Contract.methods.approve(proxy, 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').send({ from: accounts[0] }, (error, result) => {
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
    approveProxyInCOl1,
    approveProxyInDai
};