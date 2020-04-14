<h1 align="center">
  Dai.js Examples
</h1>

### other examples

See the [Maker governance dashboard repo](https://github.com/makerdao/governance-dashboard) for an example of a production application that uses dai.js.
The WIP [MCD CDP Portal](https://github.com/makerdao/mcd-cdp-portal) also uses dai.js.
The examples in this repo are simple examples that use dai.js, but note that these examples are not updated very often.

### accounts

Demo of multiple account support. See [README](https://github.com/makerdao/integration-examples/blob/master/accounts/README.md).

### leverage

Lock ETH -> Draw DAI -> Exchange Dai for ETH -> repeat

__Example usage__
```shell
export PRIVATE_KEY=0xabc... # your key goes here
export NETWORK='kovan' # choose your network here
export DEBUG=leverage.* #turn on console logging
cd leverage
babel-node . 1 400 0.1
```
* The first argument is the number of iterations
* The second argument is the ETH price floor
* The third argument is the initial amount of ETH

### react-example

Interact with Dai.js in the browser.

To set your private key:
* `cd react-example`
* `cp .env.example .env`
* Add your key (as a string) where prompted in `.env`


### TopUp

Prevent your Vault from getting liquidated (automated risk management) -- "top it up" with collateral to stay above a target collateralization ratio.

__Example usage__

Run `yarn install` or `npm install`

NB: One way to get your pivate key is to do it trough Metamask. Click on `Details` button and then on the `Export Private Key` button in your wallet account. 

```shell
export PRIVATE_KEY=0xabc... # your key goes here
export NETWORK='kovan' # choose your network here
cd topup
node . 1234 -t 2.5 -v
```
* The first argument is a CDP ID.
* The value for the `-t` argument is the target ratio.
* `-v` enables verbose mode (shows stack traces for errors).

### wyre

Use Dai.js along with the Wyre SDK for an easy fiat on or off ramp in your application.
Uses version 1.0.5 of the Wyre API, which may need an upgrade soon.

### mcd-dai
Use the `dai-mcd-plugin` to interact with the Multi Collateral Dai smart contracts


__Example Usage__
See the project's README for detailed instructions
