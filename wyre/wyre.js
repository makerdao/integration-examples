const WyreClient = require('@wyre/api').WyreClient


// Add API Keys below
const wyre = new WyreClient({
    format: "json_numberstring",
    apiKey: 'API_KEY', 
    secretKey: "SECRET_KEY",
    baseUrl: "https://api.testwyre.com/v3"
})

async function start() {

    // Account information
    try {
        let account = await wyre.get('/account');
        console.log('User: ', account.profile.name);
        console.log('Id: ', account.id);
        console.log('Total Balances: ', account.totalBalances);
        console.log('Deposit Addresses', account.depositAddresses);
    } catch (err) {
        console.log('account error', err);
    }
}

async function getWalletInfo(walletId) {
    try {
        let wallet = await wyre.get('/wallet', { walletId });
        console.log('walletInfo', wallet);
    } catch (err) {
        console.log('error', err);
    }
}


async function transferDai(address) {
    try {
        let transfer = await wyre.post('/transfers', {
            sourceCurrency: 'DAI',
            dest: `ethereum:${address}`,
            destAmount: 1,
            preview: false,
            autoConfirm: true
        });
        console.log('transfer status: ', transfer);
    } catch (err) {
        console.log('error: ', err);
    }
}

async function exchangeDaiToUsd(amount) {
    try {
        let transfer = await wyre.post('/transfers', {
            sourceCurrency: 'DAI',
            dest: "account:AC-6NCFCCMBACW",
            sourceAmount: amount,
            destCurrency: 'USD',
            // preview: true,
            autoConfirm: true
        });
        console.log('transfer status: ', transfer);
    } catch (err) {
        console.log('error: ', err);
    }
}


async function exchangeUsdToDai(amount) {
    try {
        let transfer = await wyre.post('/transfers', {
            sourceCurrency: 'USD',
            dest: "account:AC-6NCFCCMBACW",
            sourceAmount: amount,
            destCurrency: 'DAI',
            // preview: true,
            autoConfirm: true
        });
        console.log('transfer status: ', transfer);
    } catch (err) {
        console.log('error: ', err);
    }
}

async function getTransferStatus(transferId) {
    try {
        let transfer = await wyre.get('/transfer/' + transferId);
        console.log('transfer status: ', transfer);
    } catch (err) {
        console.log('transfer error', err);
    }
}

async function confirmTransfer(transferId) {
    try {
        let transfer = await wyre.post(`/transfer/${transferId}/confirm`);
        console.log('confirm status: ', transfer);
    } catch (err) {
        console.log("confirm error", err)
    }
}

async function getTransferHistory(myAccountId) {
    try {
        let transfer = await wyre.get(`/transfers/${myAccountId}`);
        console.log('transfer history: ', transfer);
    } catch (err) {
        console.log('error in getting history: ', err);
    }
}

async function transferToUsdBank(firstName, lastName, phoneNumber, accountNumber, routingNumber, currency, amount) {
    try{
        let transfer = await wyre.post('/transfers', {
            preview: true,
            dest:{
                paymentMethodType: "INTERNATIONAL_TRANSFER",
                paymentType: 'LOCAL_BANK_WIRE',
                currency: 'USD',
                country: "US",
                beneficiaryType: 'INDIVIDUAL',
                firstNameOnAccount: firstName,
                lastNameOnAccount: lastName,
                beneficiaryPhoneNumber: phoneNumber,                           
                accountNumber: accountNumber,
                routingNumber: routingNumber,
                accountType: 'CHECKING',
                chargeablePM: true
            },
            sourceCurrency: currency,
            destCurrency: 'USD',           
            sourceAmount: amount,
            autoConfirm: true 
        });
        console.log('usd to client status:', transfer);
    } catch(err) {
        console.log('usd to client', err);
    }
}



module.exports = {
    start,
    getTransferStatus,    
    confirmTransfer,
    transferDai,
    exchangeDaiToUsd,
    exchangeUsdToDai,
    transferToUsdBank
}