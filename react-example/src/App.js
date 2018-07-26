import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import StartButton from './StartButton.js';
import ProgressRecord from './ProgressRecord.js';
import Maker from '@makerdao/makerdao-exchange-integration';

class App extends Component {
  constructor(props) {
    super(props);

      this.state = {
        cdp: '',
        cdpId: '',
        maker: '',
        started: false
      }

    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  async testMakerFunctionality() {
    await this.openCdp();
    await this.getCdp();
    await this.lockEth();
    await this.drawDai();
    await this.wipeDebt();
    await this.getInfo();
    await this.shutCdp();
    return;
}

  async openCdp() {
    // Use the maker instance to call functions:
    const { maker } = this.state;

    // Use transaction events to wait for events on the blockchain:
    const cdp = await maker.openCdp();
    const cdpId = await cdp.getId();

    console.log('Opened CDP:', cdp);
    console.log('Opened CDP ID:', cdpId);

    this.setState({
      cdp: cdp,
      cdpId: cdpId
    });

    return;
  }

  async getCdp() {
    const { maker, cdpId } = this.state;

    const newCdp = await maker.getCdp(cdpId);
    console.log('Created CDP wrapper object (from ID):', newCdp);
    return;
  }

  async lockEth() {
    const { cdp } = this.state;

    const txn = await cdp.lockEth(0.1);
    console.log('Transaction from locking eth:', txn);
    return;
  }

  async getInfo() {
    const { cdp } = this.state;

    const info = await cdp.getInfo();
    console.log('Info fetched from new CDP:', info);
    return;
  }

  async shutCdp() {
    const { cdp } = this.state;

    const txn = await cdp.shut();
    console.log('Transaction from shutting the CDP:', txn);
    return;
  }

  async drawDai() {
    const { cdp } = this.state;
    const defaultAccount = this.state.maker.service('token').get('web3').defaultAccount();
    const dai = this.state.maker.service('token').getToken('DAI');
    const txn = await cdp.drawDai(1);
    const balance = await dai.balanceOf(defaultAccount);

    console.log('Transaction from drawing Dai:', txn);
    console.log('Dai balance after drawing:', balance.toString());
    return;
  }

  async wipeDebt() {
    const { cdp } = this.state;
    const defaultAccount = this.state.maker.service('token').get('web3').defaultAccount();
    const dai = this.state.maker.service('token').getToken('DAI');
    const txn = await cdp.wipeDai(1);
    const balance = await dai.balanceOf(defaultAccount);

    console.log('Transaction from wiping Dai:', txn);
    console.log('Dai balance after wiping:', balance.toString());
    return;
  }

  async handleButtonClick(){
    
    console.log(process.env.REACT_APP_PRIVATE_KEY);
    // Use ConfigFactory and 'kovan' preset to initialize a maker object:
    const maker = await new Maker('kovan', { privateKey: process.env.REACT_APP_PRIVATE_KEY, overrideMetamask: true });

    this.setState({ maker: maker });
    console.log('Maker object:', maker);
    await this.testMakerFunctionality();

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Maker Exchange Integration</h1>
        </header>
          <StartButton onButtonClick={this.handleButtonClick}/>
          <br /><p className="App-intro"><strong>Click Start then check the browser console to see the following functionality:</strong></p><br />
          <ProgressRecord/>
          <p className="App-intro">Created Maker object</p>
          <p className="App-intro">Opened CDP</p>
          <p className="App-intro">Fetched CDP ID</p>
          <p className="App-intro">Created CDP wrapper with CDP ID</p>
          <p className="App-intro">Locked eth in CDP</p>
          <p className="App-intro">Drew Dai from CDP</p>
          <p className="App-intro">Wiped Dai balance from CDP</p>
          <p className="App-intro">Fetched CDP info</p>
          <p className="App-intro">Shut CDP</p>
      </div>
    );
  }
}

export default App;
