const Maker = require('@makerdao/dai');
const infuraProjectId = 'c3f0f26a4c1742e0949d8eedfc47be67'; //dai.js project id


async function start(wyreWallet, amountToTransfer, accountPrivateKey) {

    try {
        const maker = Maker.create('kovan', {
            privateKey: accountPrivateKey,
            web3: {
                confirmedBlockCount: 15
            },
            provider: {
                infuraProjectId
            }
        });
        await maker.authenticate();
        console.log('Authenticated');

        //Get account and balance
        const balance = await maker.getToken('ETH').balanceOf(maker.currentAddress());
        console.log('Account: ', maker.currentAddress());
        console.log('balance', balance.toString());

        // GET DAI Balance
        const dai = maker.service('token').getToken('DAI');
        const daiBalance = await dai.balanceOf(maker.currentAddress())
        console.log('Dai balance before drawing:', daiBalance.toString());

        // Requesting txManager
        const txMgr = maker.service('transactionManager');

        // Transfer 1 DAI to WYRE WALLET ADDRESS        
        const transferTx = dai.transfer(wyreWallet, amountToTransfer)


        txMgr.listen(transferTx, {
            confirmed: tx => {
                console.log('Transaction Confirmed: ', tx.hash);
            },
            error: tx => {
                console.log('Transaction failed: ', tx.hash);
            }
        })

        await txMgr.confirm(transferTx);        

        // Get Dai balance after transfer to wyre
        const daiBalance2 = await dai.balanceOf(maker.currentAddress())
        console.log('Dai balance after transfer:', daiBalance2.toString());
        



    } catch (err) {
        console.log('error', err);
    }

}


module.exports = {
    start
}