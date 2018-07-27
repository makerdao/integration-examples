import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import StartButton from './StartButton.js';
import CreateMaker from './CreateMaker.js';
import OpenCdp from './OpenCdp.js';
import LockEth from './LockEth.js';
import DrawDai from './DrawDai.js';
import WipeDebt from './WipeDebt.js';
import ShutCdp from './ShutCdp.js';

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">MakerJS React Redux Example</h1>
        </header>
          <br/>
          <StartButton/>
          <br /><p className="App-intro"><strong>This application pulls in maker.js to open a cdp, lock eth, draw dai, repay the dai, and then shut the cdp.  Each transaction is sent after the other is mined.  Progress is reported below.  Click Start to begin.</strong></p><br />
          <CreateMaker/>
          <OpenCdp/>
          <LockEth/>
          <DrawDai/>
          <WipeDebt/>
          <ShutCdp/>
      </div>
    );
  }
}

export default App;
