import Web3 from 'web3';
import FaucetABI from './Faucet.json';

const web3 = new Web3(Web3.givenProvider);


console.log('web3 connected!----!',web3)

const requestTokens = async () => {
    try {
        console.log('trying to call function gulp in faucet')
        let accounts = await web3.eth.getAccounts()
        let col1= '0xc644e83399f3c0b4011d3dd3c61bc8b1617253e5'
        const faucetABI = FaucetABI;
        const faucetAddress = '0xa402e771a4662dcbe661e839a6e8c294d2ce44cf'
        const faucetContract = new web3.eth.Contract(faucetABI, faucetAddress);
        await faucetContract.methods.gulp(col1).send({from: accounts[0]}, (error, result) => console.log(error))
            

    } catch(error) {
        console.log('Request Tokens error', error)
    }
}

export default requestTokens;