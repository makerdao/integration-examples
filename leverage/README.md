<h1 align="center">
Maker.js CDP Leverage Example
</h1>

Lock ETH -> Draw DAI -> Exchange Dai for ETH -> repeat

__Example usage__
```shell
export KOVAN_PRIVATE_KEY=0xabc... # your key goes here
cd leverage
export "DEBUG=leverage.*" # turn on console logging
node . 1 100 0.1
```
* The first argument is the number of iterations
* The second argument is the ETH price floor
* The third argument is the initial amount of ETH
