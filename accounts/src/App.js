import React, { Component, Fragment } from 'react';
import './App.css';
import setupMaker, { keys } from './setupMaker';
import AccountTable from './AccountTable';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      path: "44'/60'/0'/0/0",
      accounts: [],
      cdps: [],
      keyIndex: 1,
      trezorIndex: 1,
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
          balance: await maker.getToken('ETH').balanceOf(account.address)
        };
      })
    );
    this.setState({
      accounts,
      currentAccount: maker.currentAccount()
    });
  };

  findTrezor = async () => {
    const { maker, path, trezorIndex } = this.state;
    try {
      await maker.addAccount('myTrezor' + trezorIndex, {
        type: 'trezor',
        path
      });
      this.setState({ trezorIndex: trezorIndex + 1 });
      await this.updateAccounts();
    } catch (err) {
      alert("Couldn't add Trezor: " + err.message);
    }
  };

  findLedger = async () => {
    const { maker, path } = this.state;
    try {
      await maker.addAccount('myLedger', { type: 'ledger', path });
      await this.updateAccounts();
    } catch (err) {
      alert("Couldn't add Ledger: " + err.message);
    }
  };

  useAccount = async name => {
    const { maker } = this.state;
    maker.useAccount(name);
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
  };

  addAccount = async type => {
    const { maker, keyIndex } = this.state;
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
        default:
          throw new Error('unknown type: ' + type);
      }
      await this.updateAccounts();
    } catch (err) {
      alert(err.message);
    }
  };

  render() {
    const {
      accounts,
      currentAccount,
      path,
      cdps,
      maker,
      useMetaMask
    } = this.state;
    return (
      <div>
        <h3>Demo: Multiple accounts &amp; hardware wallet integration</h3>
        {useMetaMask ? (
          <p>
            Using MetaMask as provider. <a href="/">Switch</a>
          </p>
        ) : (
          <p>
            Using HTTP provider. <a href="/?metamask">Switch</a>
          </p>
        )}
        <h4>Accounts</h4>
        <AddAccounts addAccount={this.addAccount} />
        <AccountTable
          {...{ accounts, currentAccount }}
          useAccount={this.useAccount}
        />
        <button onClick={this.findTrezor}>Connect to Trezor</button>{' '}
        <button onClick={this.findLedger}>Connect to Ledger</button>{' '}
        <label>
          Use derivation path:{' '}
          <input
            type="text"
            value={path}
            onChange={ev => this.setState({ path: ev.target.value })}
          />
        </label>
        <Transfer
          accounts={accounts}
          maker={maker}
          updateAccounts={this.updateAccounts}
        />
        <OpenCdp openCdp={this.openCdp} cdps={cdps} />
      </div>
    );
  }
}

const AddAccounts = ({ addAccount }) => (
  <p className="buttonRow">
    <button onClick={() => addAccount('browser')}>
      Add account from MetaMask
    </button>
    <button onClick={() => addAccount('provider')}>
      Add account from provider
    </button>
    <button onClick={() => addAccount('privateKey')}>
      Add another private key account
    </button>
  </p>
);

class Transfer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps, prevState) {
    const { accounts } = this.props;
    const { from, to } = this.state;
    if (accounts.length > 0 && !from) {
      this.setState({
        from: accounts[0].name,
        to: accounts[0].name
      });
    }
    if (accounts.length > 1 && from === to) {
      const changed = prevState.from !== from ? 'from' : 'to';
      const unchanged = changed === 'from' ? 'to' : 'from';
      const name = this.state[changed];
      const otherAccount = accounts.find(a => a.name !== name);
      this.setState({
        [unchanged]: otherAccount.name
      });
    }
  }

  setFrom = event => {
    this.setState({ from: event.target.value });
  };

  setTo = event => {
    this.setState({ to: event.target.value });
  };

  transfer = async () => {
    const { from, to } = this.state;
    const { accounts, maker } = this.props;
    if (!to) return alert('Pick a recipient.');
    if (from === to) return alert('Sender and receiver must be different.');
    const sender = accounts.find(a => a.name === from);
    const receiver = accounts.find(a => a.name === to);
    maker.useAccount(sender.name);
    await maker.getToken('ETH').transfer(receiver.address, 1);
    await this.props.updateAccounts();
  };

  render() {
    const { accounts } = this.props;
    return (
      <p>
        Send 1 ETH from{' '}
        <AccountSelect
          accounts={accounts}
          value={this.state.from}
          onChange={this.setFrom}
        />{' '}
        to{' '}
        <AccountSelect
          accounts={accounts}
          value={this.state.to}
          onChange={this.setTo}
        />{' '}
        <button onClick={this.transfer}>Transfer</button>
      </p>
    );
  }
}

const AccountSelect = ({ accounts, onChange, value }) => {
  return (
    <select value={value} onChange={onChange}>
      {accounts.map(({ name }) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
};

const OpenCdp = ({ openCdp, cdps }) => (
  <Fragment>
    <p>
      <button onClick={openCdp}>Open a CDP using the selected account</button>
    </p>
    <h4>CDPs created</h4>
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
  </Fragment>
);
