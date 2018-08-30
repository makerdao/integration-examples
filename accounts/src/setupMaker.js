import trezorPlugin from '@makerdao/dai-plugin-trezor-web';
import ledgerPlugin from '@makerdao/dai-plugin-ledger-web';
const Maker = require('@makerdao/dai');

// These are keys that are set up in our test chain with some Ether.
export const keys = [
  'b178ad06eb08e2cd34346b5c8ec06654d6ccb1cadf1c9dbd776afd25d44ab8d0',
  '819d5a9152a1aa37b514d13f861d5e53aae810eedd3876f3f9aaf9e6bcb7c2bb',
  'c15a32c1dc58c5a893ff141e668b816074bdcdf460956c36d7c4f3e3c5e1a04a',
  'dc21e321bc4ce4f5daacb7acbc4b7875a48335308ade8dca87c93c266c6cf318',
  'c9e69677a85b5f66969e134b915320942f4a1a6529aa1e7bc4cb6e3d059a1e6b'
];

const TESTNET_URL = 'http://localhost:2000';

export default async function(useMetaMask) {
  window.Maker = Maker;
  const maker = Maker.create(useMetaMask ? 'browser' : 'http', {
    url: TESTNET_URL,
    plugins: [trezorPlugin, ledgerPlugin],
    accounts: {
      test1: { type: 'privateKey', key: keys[0] }
    }
  });

  await maker.authenticate();
  if (maker.service('web3').networkId() !== 999) {
    alert(
      'To work with testchain accounts, configure MetaMask to use ' +
        `"Custom RPC" with address "${TESTNET_URL}".`
    );
  }
  return maker;
}
