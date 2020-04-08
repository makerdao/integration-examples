import React from 'react';
import UserInfo from './components/UserInfo'
import './App.css';
import { MetaMaskButton, Loader } from 'rimble-ui'
import { connect, getWeb3 } from './utils/web3';

let networkId = window.ethereum.networkVersion
if (networkId === '1') {
  alert('change to a testnet network')
}

let maker = null;

class App extends React.Component {
  state = {
    maker: 'false',
    load: false,
    networkId: ''
  }

  static getDerivedStateFromProps(props, state) {
    networkId = window.ethereum.networkVersion
    return state.networkId = networkId
  }

  handleMetamask = async () => {
    this.setState({ load: true })
    networkId = window.ethereum.networkVersion
    maker = await connect(networkId)
    getWeb3()
    this.setState({ maker: true });
  }

  render() {
    networkId = window.ethereum.networkVersion
    let connected = this.state.maker === true ? true : false
    let disabled = networkId === '1' ? true : false

    return (
      <div className="App" >
        <h1>MakerDAO Dai MCD Plugin Demo</h1>
        <p>For this demo: use kovan, goerli, rinkeby or ropsten networks and have some ETH on the network you are using</p>
        <p>This is based on the <a href='https://changelog.makerdao.com/' target="_blanka" > 1.0.2 Release</a></p>
        <p>If opening app for the first time, you'll be asked to create a proxy contract, which will help handle your interactions with the Maker Protocol</p>
        {
          connected ? <UserInfo maker={maker} /> : (
            <MetaMaskButton.outline
              disabled={disabled}
              onClick={this.handleMetamask}
            >
              {this.state.load ? <Loader color='black' /> : 'Connect With Metamask'}
            </MetaMaskButton.outline>
          )
        }
      </div>
    );

  }
}

export default App;
