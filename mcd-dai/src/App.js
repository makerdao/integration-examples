import React from 'react';
import UserInfo from './components/UserInfo'
import './App.css';
import { MetaMaskButton } from 'rimble-ui'
import { connect, getWeb3 } from './utils/web3';
import { ETH, COL1, MDAI } from '@makerdao/dai-plugin-mcd';

import { requestTokens, approveProxyInCOl1, approveProxyInDai } from './utils/web3';

let maker = null;
let cdpManager = null;
let proxy = null;
let cdps = null;


class App extends React.Component {
  state = {
    maker: 'false'
  }
  handleMetamask = async () => {
    maker = await connect()
    getWeb3()
    proxy = await maker.currentProxy();
    console.log('proxy', proxy)
    cdpManager = maker.service('mcd:cdpManager');
    this.setState({ maker: true })
  }
  logMaker = async () => {
    try {

      // requestTokens()
      // approveCOL1Token()
      // const cdp1 = await cdpManager.openLockAndDraw('COL1-A', COL1(49), MDAI(1));
      // console.log('cdp1', cdp1)
      // await cdpManager.openLockAndDraw('ETH-A', ETH(0.01), MDAI(2));
      // const open = await cdpManager.open('COL1-A');
      // console.log('open', open);
      // const lock = await cdpManager.lockAndDraw(29, 'COL1-A', COL1(49), MDAI(1))
      // console.log('lock', lock)
      // approveProxyInDai()

      // const cdp12 = await cdpManager.getCdp(28);
      // console.log('cdp12', cdp12)
      // const cdp11 = await cdpManager.getCdp(11);
      // console.log('cdp12', cdp11)

      // const lock = await cdp12.lockCollateral(COL1(49))
      // console.log('lock', lock)


    } catch (error) {
      console.log(error)
    }
    // console.log('maker', maker)
    console.log('cdpManager', cdpManager)
    // console.log('cdpType', cdpType)
    // console.log('systemData', systemData)
    // console.log('accounts', accounts);
  }

  lockCollateral = async () => {
    await approveProxyInCOl1()
    setTimeout(async () => {
      const cdp1 = await cdpManager.openLockAndDraw('COL1-A', COL1(50), MDAI(1));
      console.log('cdp1', cdp1)
    }, 10000);
  }

  

  render() {
    let connected = this.state.maker === true ? true : false
    return (
      <div className="App" >
        <h1>MakerDAO Dai MCD Plugin</h1>
        <p>For this demo: use kovan network and have some ETH</p>
        {
          connected ? <UserInfo maker={maker} /> : (
            <MetaMaskButton.outline
              onClick={this.handleMetamask}
            >
              Connect With Metamask
            </MetaMaskButton.outline>
          )
        }        
      </div>
    );

  }
}

export default App;
