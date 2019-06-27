### Exchange integration example

This is a basic React app (created with `create-react-app`) that imports `@makerdao/dai`, initializes a new `Maker` object, and uses it for basic CDP functionality.

Simply clone this repo, run `yarn` to install dependencies, and `yarn start`.  You'll also need to set a couple environment variables:

```
export REACT_APP_NETWORK='kovan'
// or 'mainnet'
export REACT_APP_PRIVATE_KEY='...your private key'
```
