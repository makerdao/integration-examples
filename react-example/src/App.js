import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import StartButton from './StartButton.js';
import CreateMaker from './CreateMaker.js';
import OpenCdp from './OpenCdp.js';
import LockEth from './LockEth.js';

class App extends Component {
  constructor(props) {
    super(props);

      this.state = {
        cdp: '',
        cdpId: '',
        started: false
      }
  }

  async testMakerFunctionality(maker) {
    await this.openCdp(maker);
    await this.getCdp(maker);
    await this.lockEth();
    await this.drawDai(maker);
    await this.wipeDebt(maker);
    await this.getInfo();
    await this.shutCdp();
    return;
}

  async openCdp(maker) {

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

  async getCdp(maker) {
    const { cdpId } = this.state;

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

  async drawDai(maker) {
    const { cdp } = this.state;
    const defaultAccount = maker.service('token').get('web3').defaultAccount();
    const dai = maker.service('token').getToken('DAI');
    const txn = await cdp.drawDai(1);
    const balance = await dai.balanceOf(defaultAccount);

    console.log('Transaction from drawing Dai:', txn);
    console.log('Dai balance after drawing:', balance.toString());
    return;
  }

  async wipeDebt(maker) {
    const { cdp } = this.state;
    const defaultAccount = maker.service('token').get('web3').defaultAccount();
    const dai = maker.service('token').getToken('DAI');
    const txn = await cdp.wipeDai(1);
    const balance = await dai.balanceOf(defaultAccount);

    console.log('Transaction from wiping Dai:', txn);
    console.log('Dai balance after wiping:', balance.toString());
    return;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Maker Exchange Integration</h1>
        </header>
          <StartButton/>
          <br /><p className="App-intro"><strong>Click Start then check the browser console to see the following functionality:</strong></p><br />
          <CreateMaker/>
          <OpenCdp/>
          <LockEth/>
          <p className="App-intro">Drew Dai from CDP</p>
          <p className="App-intro">Wiped Dai balance from CDP</p>
          <p className="App-intro">Fetched CDP info</p>
          <p className="App-intro">Shut CDP</p>
      </div>
    );
  }
}

export default App;
