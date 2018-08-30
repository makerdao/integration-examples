# Accounts Demo

A demo app that shows support for multiple accounts in the Dai.js library.

Includes plugins that add support for Ledger and Trezor:
- [dai-plugin-trezor-web](trezor-plugin)
- [dai-plugin-ledger-web](ledger-plugin)

It is set up to work with the Dai.js [test chain](testchain). You can add
accounts from Trezor, Ledger, MetaMask, and private keys, transfer ETH between
accounts, and open CDPs with any of them.

```shell
yarn install
HTTPS=true yarn start # HTTPS is necessary for Ledger
```

[daijs]: https://github.com/makerdao/dai.js
[testchain]: https://github.com/makerdao/dai.js/blob/dev/testchain/scripts/with-deployed-system
[trezor-plugin]: https://github.com/makerdao/dai-plugin-trezor-web
[ledger-plugin]: https://github.com/makerdao/dai-plugin-ledger-web
