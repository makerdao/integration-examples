### Exchange integration example

This is a basic React app (created with `create-react-app`) that imports `@makerdao/dai`, initializes a new `Maker` object, and uses it for basic CDP functionality.

The only relevant code is in `src/App.js`, unless you want to run it yourself, in which case you can simply clone this repo, `npm install`, and `npm start`.  You'll also need to set a couple environment variables:

`export REACT_APP_NETWORK='kovan'
`export REACT_APP_PRIVATE_KEY=0xYour_Private_key`
