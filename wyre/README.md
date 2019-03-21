#### DAI-WYRE PLugin

This is a JS script that connects to wyre and dai APIs to:    
- Send DAI to wyre account
- Exchange DAI/USD or USD/DAI
- Send DAI back to an ethereum account from wyre
- Send USD to a bank account. 

Run `npm install` to get the necessary dependencies.    
#### NOTE: By default you'll interact with the `kovan` test network. If you want to try it on the `mainnnet` just change the `kovan` parameter to `mainnet` in `maker.create()` function in `dai.js` file.

In order to transfer you need to provide your wallet keys.
You need to add the `wyreEthereumWallet`, `amountOfDaiToTransfer` and `accountPrivateKey` in the `dai.start()` function in `main.js`. 

Also, provide your `DAI` address in the `wyre.transferDai()` function so as to receive funds back from wyre.

Lastly, you need to provide your wyre API keys in `wyre.js` file so you could use their api services. One gets these keys by registering their account on https://www.testwyre.com/ or https://www.sendwyre.com/ if running on mainnet.

After adding the variables in the `main.js`, you can run it by `node main.js` command.   
A series of logs will appear in the console confirming each step in the process. 



## Steps to take
Use Dai.js to    
  - Make connection to kovan testnet by chosing `kovan` and providing your wallet `private key` of your account. This is done by calling `maker.create('kovan', {privateKey: '0x123123123'})`
  - Get current dai balance from your wallet
      - Invoke the `dai` object by calling `maker.service('token').getToken('DAI')` 
      - Call the `dai.balanceOf(maker.currentAddress())`
  - Make transfer to wyre ethereum wallet
    - We do this by calling the `transfer` function from `dai`: `dai.transfer(wyreWallet, amountOfDai)`
  
User wyre api to
- Authenticate into wyre service by providing `API_KEY` and `SECRET_KEY`
- Check balance in wyre by calling the `/account` endpoint 
- Exchange DAI to USD by calling the endpoint `/transfers` with these parameters:
  - `sourceCurrency:'DAI'` - currency you want to exchange from 
  - `dest: 'your account id'` - as you just exchange your currency, you provide your own account.
  - `sourceAmount: amount` - here you define the amount of your sourceCurrency tha you want to exchange
  - `destCurrency: 'USD/EUR/CNY/ETH/BTC'` - here you choose to what currency you want to exchange your sourceCurrency
  - `autoConfirm: true` - here you allow the api request to be autoconfirmed instead of you calling another endpoint to confirm it manually.
- Transfer dai from wyre to any ethereum account
  - Process is similar to the one mentioned above. `/transfers` request needs to change the `dest: 'ethereum:0x123....'` address to some external ethereum account. 
  - Here, wyre will make the transfer and give you a transaction status when submitting the request. 
- Sending USD to Wyre involves adding your bank account information in the wyre dashboard and having a transfer to their specified details. 
- Exchanging `USD` to `DAI` is again as mentioned before, using `/transfers` api endpoint we provide `sourceCurrenncy: 'USD"` and `destCurrency:'DAI'`. Here, the wyre engine will make the exchange of the currencies. 
- To transfer `USD` to an ethereum account in `DAI`, one needs to change the value in `dest: 'ethereum:0x123....'` and the `destCurrencey: DAI`.
- To transfer to an individual's US bank account you can use the built function in `wyre.js`:        `transferToUsdBank(firstName, lastName, phoneNumber, accountNumber, routingNumber, currency, amount)`    
  - `currency` - here you can choose if you want to send from a certain type of currency that is available on wyre. You can choose `DAI` and wyre will convert your DAI to USD in the transfer process for you. 
  - `amount` - is how much of the sourceCurrency (`USD, DAI, EUR, ETH, BTC,...`) you want to send to the `USD` bank account. 
