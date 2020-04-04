import Maker from '@makerdao/dai';
import McdPlugin, { ETH, BAT } from '@makerdao/dai-plugin-mcd';
import FaucetABI from './Faucet.json';
import dsTokenAbi from './dsToken.abi.json';
import rinkebyAddresses from '../references/contracts/rinkeby.json'
import goerliAddresses from '../references/contracts/goerli';
import ropstenAddresses from '../references/contracts/ropsten';
import kovanAddresses from '../references/contracts/kovan.json'
//import MakerOtc from 'dai-plugin-maker-otc'

let maker = null;
let web3 = null;
// let MakerOtc = null;


let networkId = window.ethereum.networkVersion
let contractAddresses = {}


const outputAddresses = (networkId) => {
    switch (Number(networkId)) {
        case 3:
            contractAddresses = ropstenAddresses
            break;
        case 4:
            contractAddresses = rinkebyAddresses
            break;
        case 5:
            contractAddresses = goerliAddresses
            break;
        case 42:
            contractAddresses = kovanAddresses
            break;
        default:
            return contractAddresses;
    }
    return contractAddresses
}

const otherNetworksOverrides = [
    {
        network: 'rinkeby',
        contracts: rinkebyAddresses
    },
    { network: 'goerli', contracts: goerliAddresses },
    { network: 'ropsten', contracts: ropstenAddresses }
].reduce((acc, { network, contracts }) => {
    for (const [contractName, contractAddress] of Object.entries(contracts)) {
        if (!acc[contractName]) acc[contractName] = {};
        acc[contractName][network] = contractAddress;
    }
    return acc;
}, {});

const cdpTypes = [
    { currency: ETH, ilk: 'ETH-A' },
    { currency: BAT, ilk: 'BAT-A' }
];

const defineNetwork = (networkId) => {
    let network = {
        network: ''
    }
    switch (Number(networkId)) {
        case 3:
            network.network = 'ropsten'
            break;
        case 4:
            network.network = 'rinkeby'
            break;
        case 42:
            network.network = 'kovan'
            break;
        case 5:
            network.network = 'goerli'
            break;
        default:
            return network;
    }

    return network
}

const connect = async (networkId) => {
    let networkNumber = await networkId;
    let network = defineNetwork(networkNumber);
    const addressOverrides = ['rinkeby', 'ropsten', 'goerli'].some(
        networkName => networkName === network.network
    )
        ? otherNetworksOverrides
        : {};

    const mcdPluginConfig = {
        cdpTypes,
        addressOverrides
    };

    const config = {
        plugins: [
            [McdPlugin, mcdPluginConfig]
        ],
        smartContract: {
            addressOverrides
        },
    };
    outputAddresses(networkId)
    maker = await Maker.create('browser', config);
    await maker.authenticate();
    await maker.service('proxy').ensureProxy();
    //await maker.service('exchange')
    return maker;
}


const getWeb3 = async () => {
    web3 = await maker.service('web3')._web3;
    console.log('web3', await web3.eth.net.getNetworkType());
    return web3;
}

const requestTokens = async () => {
    try {
        console.log('trying to call function gulp in faucet')
        let accounts = await web3.eth.getAccounts()
        let BAT = contractAddresses.BAT
        const faucetABI = FaucetABI;
        const faucetAddress = contractAddresses.FAUCET
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
        let BATAddress = contractAddresses.BAT
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
        let daiAddress = contractAddresses.MCD_DAI
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

const batAllowance = async () => {
    try {
        let accounts = await web3.eth.getAccounts();
        let proxy = await maker.currentProxy();
        let BATAddress = contractAddresses.BAT
        const BATAbi = dsTokenAbi;
        const BATContract = new web3.eth.Contract(BATAbi, BATAddress);
        return new Promise(async (resolve, reject) => {
            await BATContract.methods.allowance(accounts[0], proxy).call({ from: accounts[0] }, (error, result) => {
                if(error) {
                    console.log('error in calling allowance mapping')
                    reject(error)
                }
                // console.log('result in reading allowance mapping', result)
                resolve(result)
            })
        })
    } catch (error) {
        console.log(error)
    }

}

const daiAllowance = async () => {
    try {
        let accounts = await web3.eth.getAccounts();
        let proxy = await maker.currentProxy();
        let daiAddress = contractAddresses.MCD_DAI
        const DAIAbi = dsTokenAbi;
        const DAIContract = new web3.eth.Contract(DAIAbi, daiAddress);
        return new Promise(async (resolve, reject) => {
            await DAIContract.methods.allowance(accounts[0], proxy).call({ from: accounts[0] }, (error, result) => {
                if(error) {
                    console.log('error in calling allowance mapping')
                    reject(error)
                }
                // console.log('result in reading allowance mapping', result)
                resolve(result)
            })
        })
    } catch (error) {
        console.log(error)
    }

}

const doneInFaucet = async () => {
    try {
        let accounts = await web3.eth.getAccounts();
        let BATAddress = contractAddresses.BAT
        const faucetABI = FaucetABI;
        const faucetAddress = contractAddresses.FAUCET
        const faucetContract = new web3.eth.Contract(faucetABI, faucetAddress);
        return new Promise(async (resolve, reject) => {
            await faucetContract.methods.done(accounts[0],BATAddress).call({ from: accounts[0] }, (error, result) => {
                if(error) {
                    console.log('error in reading done in faucet')
                    reject(error)
                }
                resolve(result)
            })
        })
    }catch(error){
        console.log(error)
    }
}

const leverage = async (iterations = 2, priceFloor = 175, principal = 0.25) => {
    const cdpManager = maker.service('mcd:cdpManager');
    console.log('cdpManager', cdpManager)
    const cdpType = maker.service('mcd:cdpType');
    console.log('cdpType', cdpType)
    const liquidationRatioString = await cdpType.cdpTypes[0].liquidationRatio;
    const liquidationRatio = liquidationRatioString.toNumber()
    const priceEth = await cdpType.cdpTypes[0].price.toNumber()
    console.log(`Liquidation ratio: ${liquidationRatio}`);
    console.log(`Current price of ETH: ${priceEth}`);

    // const cdp = await cdpManager.getCdp(642)
    // console.log(cdp)
    // console.log('Collateral Amount: ', cdp.collateralAmount.toNumber())
    // console.log('Collateral Value: ', cdp.collateralValue.toNumber())
    // console.log('Debt: ', cdp.debtValue.toNumber())
    console.log('opening CDP...');
    let cdp = await cdpManager.open('ETH-A', { cache: false })
    console.log('CDP, ', cdp)
    const id = cdp.id
    console.log(`CDP ID: ${id}`);


    // calculate a collateralization ratio that will achieve the given price floor
    const collatRatio = priceEth * liquidationRatio / priceFloor;
    console.log(`Target ratio: ${collatRatio}`);

    // calculate how much Dai we need to draw in order
    // to achieve the desired collateralization ratio
    let drawAmt = Math.floor(principal * priceEth / collatRatio);
    console.log('Drawing: ', drawAmt)
    await cdpManager.lockAndDraw(id, cdp.ilk, ETH(principal), drawAmt);
    console.log(`drew ${drawAmt} Dai`);

    // do `iterations` round trip(s) to the exchange
    for (let i = 0; i < iterations; i++) {
        // exchange the drawn Dai for W-ETH
        let tx = await maker.service('exchange').sellDai(drawAmt, 'WETH', '0.03');
        console.log(`Selling ${drawAmt} Dai`, tx)
        // observe the amount of W-ETH received from the exchange
        // by calling `fillAmount` on the returned transaction object
        let returnedWeth = tx.fillAmount() / 10 ** 18;
        console.log(`exchanged ${drawAmt} Dai for ${returnedWeth}`);

        // calculate how much Dai we need to draw in order to
        // lock all of the W-ETH we just received into our CDP
        // re-attain our desired collateralization ratio
        drawAmt = Math.floor(returnedWeth * priceEth / collatRatio);
        await cdpManager.lockAndDraw(id, cdp.ilk, ETH(returnedWeth), drawAmt);
        console.log(`locked ${returnedWeth}`);
        console.log(`drew ${drawAmt} Dai`);
    }

    // get the final state of our CDP
    cdp = await cdpManager.getCdp(id, { cache: false });
    const collateralAmount = cdp.collateralAmount.toNumber();
    const collateralValue = cdp.collateralValue.toNumber();
    const debt = cdp.debtValue.toNumber();


    const cdpState = {
        collateralValue,
        collateralAmount,
        debt,
        id,
        principal,
        iterations,
        priceFloor,
        finalDai: drawAmt
    };

    console.log(`Created CDP: ${JSON.stringify(cdpState)}`);
}

const sell5Dai = async () => {
    let tx = await maker.service('exchange').sellDai('5', 'WETH', '0.001');
    console.log('Seeling 5 Dai', tx)
    console.log('Seeling 5 Dai', tx.fillAmount())
}

const buyDai = async () => {
    let tx = await maker.service('exchange').buyDai('5', 'WETH', '0.001');
    console.log('Buying 5 Dai', tx)
    console.log('Buying 5 Dai', tx.fillAmount())
}

export {
    requestTokens,
    getWeb3,
    connect,
    approveProxyInBAT,
    approveProxyInDai,
    leverage,
    sell5Dai,
    buyDai,
    defineNetwork,
    batAllowance,
    daiAllowance,
    doneInFaucet
};