import React, { Component } from 'react';
import logo from '../logo.svg';
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
          <h1 className="App-title">Dai.js React/Redux Example</h1>
        </header>
          <br/>
          <StartButton/>
          <br /><p className="App-intro"><strong>This application uses Dai.js to open a CDP, lock ether, draw Dai, repay the Dai, and then shut the CDP.  Each transaction fires sequentially after you press 'Start,' and progress updates will appear below. Open the console to see more logging, and don't forget to set the necessary variables as described in the <a href="https://github.com/makerdao/integration-examples/blob/master/react-example/README.md" target="_blank" rel="noopener noreferrer">documentation</a>.</strong></p><br />
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
