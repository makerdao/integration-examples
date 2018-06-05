<h1 align="center">
  Integration/Maker.js Examples
</h1>

### leverage

Lock ETH -> Draw DAI -> Exchange Dai for ETH -> repeat

__Example usage__
```shell
export KOVAN_PRIVATE_KEY=0xabc... # your key goes here
cd leverage
npm start # starts a web server

# in a new terminal:
curl "localhost:1337?iterations=3&priceFloor=600&principal=0.1"
```

### react-example

Interact with Maker.js in the browser

### topup

Prevent your CDP from getting liquidated (automated risk management) -- "top it up" with collateral to stay above a target collateralization ratio.

__Example usage__
```shell
export KOVAN_PRIVATE_KEY=0xabc... # your key goes here
cd topup
node . 1234 -t 2.5 -v
```
* The first argument is a CDP ID.
* The value for the `-t` argument is the target ratio.
* `-v` enables verbose mode (shows stack traces for errors).
