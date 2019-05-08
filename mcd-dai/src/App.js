import React from 'react';
import UserInfo from './components/UserInfo'
import './App.css';
import { MetaMaskButton } from 'rimble-ui'
import Maker from '@makerdao/dai';
import McdPlugin, { ETH, COL1, MDAI } from '@makerdao/dai-plugin-mcd';

let maker = null;
let cdpManager = null;
let cdpType = null;
let systemData = null;
let accounts = null;
let proxy = null;
let cdps = null;
class App extends React.Component {
  state = {
    maker: 'false'
  }
  handleMetamask = async () => {
    maker = await Maker.create('browser', {
      plugins: [
        [
          McdPlugin,
          {
            cdpTypes: [
              { currency: ETH, ilk: 'ETH-A' },
              { currency: COL1, ilk: 'COL1-A' },
            ]
          }
        ]
      ]
    });
    await maker.authenticate();
    await maker.service('proxy').ensureProxy();
    proxy = await maker.currentProxy();
    cdpManager = maker.service('mcd:cdpManager');
    cdps = await cdpManager.getCdpIds(proxy);
    cdpType = maker.service('mcd:cdpType')
    systemData = maker.service('mcd:systemData');
    accounts = maker.service('accounts');
    this.setState({ maker: true })
  }
  logMaker = async () => {
    try {
      // const cdp1 = await cdpManager.openLockAndDraw('COL1-A', COL1(50), MDAI(1000));
      // console.log('cdp1', cdp1)

    } catch (error) {
      console.log(error)
    }
    console.log('cdps', cdps);
    console.log('maker', maker)
    console.log('cdpManager', cdpManager)
    console.log('cdpType', cdpType)
    console.log('systemData', systemData)
    console.log('accounts', accounts);
  }

  render() {
    let connected = this.state.maker === true ? true : false
    return (
      <div className="App" >
        <h1>MakerDAO Dai MCD Plugin</h1>
        <p>For this demo use kovan network</p>
        {
          connected ? <UserInfo maker={maker} /> : (
            <MetaMaskButton.outline
              onClick={this.handleMetamask}
              disabled={connected}
            >
              Connect With Metamask
            </MetaMaskButton.outline>
          )
        }


        <button
          onClick={this.logMaker}
        >log</button>
      </div>
    );

  }
}

export default App;
