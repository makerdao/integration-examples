import React, { Component, Fragment } from 'react';
import './App.css';
import setupMaker, { keys } from './setupMaker';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      cdps: [],
      useMetaMask: window.location.search.includes('metamask')
    };
  }

  componentDidMount() {
    setupMaker(this.state.useMetaMask)
      .then(maker => {
        this.setState({ maker });
        this.updateAccounts(maker);
      })
      .catch(err => {
        console.log(err);
        alert("Couldn't set up Maker: " + err.message);
      });
  }

  updateAccounts = async maker => {
    if (!maker) maker = this.state.maker;
    const accounts = await Promise.all(
      maker.listAccounts().map(async account => {
        return {
          ...account,
          balance: await this.toStr(maker.getToken('ETH').balanceOf(account.address))
        };
      })
    );
    this.setState({
      accounts,
      currentAccount: maker.currentAccount()
    });
  };

  toStr = async promise => {
    const val = await promise;
    console.log('val.toString()', val.toString());
    return val.toString();
  };

  useAccount = async name => {
    const { maker } = this.state;
    maker.useAccount(name);
    await this.updateAccounts();
  };

  useAccountWithAddress = async address => {
    const { maker } = this.state;
    maker.useAccountWithAddress(address);
    await this.updateAccounts();
  };

  openCdp = async () => {
    const { maker } = this.state;
    const cdp = await maker.openCdp();
    const id = await cdp.getId();
    const info = await cdp.getInfo();
    this.setState(({ cdps }) => ({
      cdps: [...cdps, { id, owner: info.lad.toLowerCase() }]
    }));
    await this.updateAccounts();
  };

  render() {
    const { accounts, currentAccount, cdps, maker, useMetaMask } = this.state;
    return (
      <div className="container">
        <div className="header">
          Dai.js demo: Multiple accounts &amp; hardware wallet integration
        </div>
        <div className="sidebar">
          <div>
            <h4>Add accounts</h4>
            <AddAccounts
              addAccount={this.addAccount}
              maker={maker}
              updateAccounts={this.updateAccounts}
              setPath={path => this.setState({ path })}
            />
          </div>
          <div>
            <h4> Select account to use... </h4>
            <h5>
              By name:{' '}
              <AccountSelectByName
                accounts={accounts}
                value={currentAccount && currentAccount.name}
                onSelect={name => this.useAccount(name)}
              />
            </h5>
            <h5>
              Or by address:{' '}
              <AccountSelectByAddress
                  accounts={accounts}
                  value={currentAccount && currentAccount.address}
                  onSelect={address => this.useAccountWithAddress(address)}
              />
            </h5>
            <Transfer
              {...{ currentAccount, accounts, maker }}
              updateAccounts={this.updateAccounts}
            />
            <button onClick={this.openCdp}>Open a CDP</button>
          </div>
          <div>
            {useMetaMask ? (
              <Fragment>
                Using MetaMask provider for all transactions.
                <br />
                <a href="/">Switch to HTTP provider</a>
              </Fragment>
            ) : (
              <Fragment>
                Using HTTP provider for all transactions from non-Metamask
                accounts.
                <br />
                <a href="/?metamask">Switch to MetaMask</a>
              </Fragment>
            )}
          </div>
        </div>
        <DataTables {...{ accounts, currentAccount, cdps }} />
      </div>
    );
  }
}

const DataTables = ({ accounts, currentAccount, cdps }) => (
  <div className="main">
    <h4>Available accounts</h4>
    <AccountTable {...{ accounts, currentAccount }} />
    <h4>CDPs created</h4>
    <CdpsTable cdps={cdps} />
  </div>
);

class AddAccounts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      path: "44'/60'/0'/0/0",
      keyIndex: 1,
      trezorIndex: 1,
      ledgerIndex: 1
    };
  }

  add = async type => {
    const { maker } = this.props;
    const { keyIndex, path, trezorIndex, ledgerIndex } = this.state;
    try {
      switch (type) {
        case 'browser':
          await maker.addAccount('metamask', { type: 'browser' });
          break;
        case 'provider':
          await maker.addAccount('fromProvider', { type: 'provider' });
          break;
        case 'privateKey': {
          if (keyIndex >= keys.length) return alert('No more keys');
          await maker.addAccount('test' + (keyIndex + 1), {
            type: 'privateKey',
            key: keys[keyIndex]
          });
          this.setState({ keyIndex: keyIndex + 1 });
          break;
        }
        case 'privateKeyNoName': {
          if (keyIndex >= keys.length) return alert('No more keys');
          await maker.addAccount(null, {
            type: 'privateKey',
            key: keys[keyIndex]
          });
          this.setState({ keyIndex: keyIndex + 1 });
          break;
        }
        case 'trezor':
          await maker.addAccount('myTrezor' + trezorIndex, {
            type: 'trezor',
            path: path,
            accountsLength: 5,
            choose: (addresses, callback) => {
              this.setState({
                accountChoices: addresses,
                pickAccount: callback
              });
            }
          });
          this.setState({ trezorIndex: trezorIndex + 1 });
          break;
        case 'trezorNoName':
          await maker.addAccount({
            type: 'trezor',
            path: path,
            accountsLength: 5,
            choose: (addresses, callback) => {
              this.setState({
                accountChoices: addresses,
                pickAccount: callback
              });
            }
          });
          this.setState({ trezorIndex: trezorIndex + 1 });
          break;
        case 'ledgerLive':
          await maker.addAccount('myLedger' + ledgerIndex, {
            type: 'ledger',
            accountsLength: 5,
            choose: (addresses, callback) => {
              this.setState({
                accountChoices: addresses,
                pickAccount: callback
              });
            }
          });
          this.setState({ ledgerIndex: ledgerIndex + 1 });
          break;
        case 'ledgerLegacy':
          await maker.addAccount('myLedger' + ledgerIndex, {
            type: 'ledger',
            legacy: true,
            accountsLength: 5,
            choose: (addresses, callback) => {
              this.setState({
                accountChoices: addresses,
                pickAccount: callback
              });
            }
          });
          this.setState({ ledgerIndex: ledgerIndex + 1 });
          break;
        default:
          throw new Error('unknown type: ' + type);
      }
      await this.props.updateAccounts();
    } catch (err) {
      alert("Couldn't add account: " + err.message);
    }
  };

  pick(address) {
    this.state.pickAccount(null, address);
    this.setState({ accountChoices: null });
  }

  render() {
    const { path, accountChoices } = this.state;
    return (
      <div className="buttonRow">
        <button onClick={() => this.add('browser')}>MetaMask</button>
        <button onClick={() => this.add('provider')}>Provider</button>
        <button onClick={() => this.add('privateKey')}>Private key</button>
        <br />
        <button onClick={() => this.add('trezor')}>Trezor</button>
        <button onClick={() => this.add('ledgerLive')}>Ledger Live</button>
        <button onClick={() => this.add('ledgerLegacy')}>Ledger legacy</button>
        <br />
        <button onClick={() => this.add('privateKeyNoName')}>Private key - no name</button>
        <button onClick={() => this.add('trezorNoName')}>Trezor - no name</button>
        <br />
        <label>
          Derivation path:{' '}
          <input
            type="text"
            value={path}
            onChange={ev => this.setState({ path: ev.target.value })}
          />
        </label>
        {accountChoices && (
          <div className="account-picker">
            <h5>Pick an address</h5>
            {accountChoices.map(address => (
              <div key={address} className="account-choice">
                {address}
                <button onClick={() => this.pick(address)}>Pick</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

class Transfer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate() {
    if (!this.state.toName && this.props.accounts.length > 1) {
      this.setState({ toName: this.props.accounts[1].name });
    }
  }

  transfer = async () => {
    const { toName } = this.state;
    const {
      currentAccount: { name: fromName },
      accounts,
      maker
    } = this.props;
    if (!toName) return alert('Pick a recipient.');
    if (fromName === toName)
      return alert('Sender and receiver must be different.');
    const sender = accounts.find(a => a.name === fromName);
    const receiver = accounts.find(a => a.name === toName);

    maker.useAccount(sender.name);
    await maker.getToken('ETH').transfer(receiver.address, 1);
    await this.props.updateAccounts();
  };

  render() {
    return (
      <p>
        Send 1 ETH to{' '}
        <AccountSelectByName
          accounts={this.props.accounts}
          value={this.state.toName}
          onSelect={toName => this.setState({ toName })}
        />{' '}
        <button onClick={this.transfer}>Transfer</button>
      </p>
    );
  }
}

const AccountSelectByName = ({ value, onSelect, accounts }) => (
  <select value={value} onChange={ev => onSelect(ev.target.value)}>
    {accounts.map(({ name }) => (
      <option key={name} value={name}>
        {name}
      </option>
    ))}
  </select>
);

const AccountSelectByAddress = ({ value, onSelect, accounts }) => (
  <select value={value} onChange={ev => onSelect(ev.target.value)}>
    {accounts.map(({ address }) => (
      <option key={address} value={address}>
        {address}
      </option>
    ))}
  </select>
);

const CdpsTable = ({ cdps }) => (
  <table>
    <thead>
      <tr>
        <th>id</th>
        <th>owner</th>
      </tr>
    </thead>
    <tbody>
      {cdps.map(({ id, owner }) => (
        <tr key={id}>
          <td>{id}</td>
          <td>{owner}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const AccountTable = ({ accounts }) => (
  <table>
    <thead>
      <tr>
        <th>name</th>
        <th>type</th>
        <th>address</th>
        <th>ETH balance</th>
      </tr>
    </thead>
    <tbody>
      {accounts.map(({ name, address, balance, type }) => (
        <tr key={name}>
          <td>{name}</td>
          <td>{type}</td>
          <td>{address}</td>
          <td>{balance}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
