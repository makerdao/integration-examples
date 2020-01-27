import React from 'react';
import DsrDemo from './components/DsrDemo'
import './App.css';
import { MetaMaskButton, Loader } from 'rimble-ui'
import { connect, getWeb3 } from './utils/web3';


let maker = null;

class App extends React.Component {
  state = {
    maker: 'false',
    load: false,
  }
  handleMetamask = async () => {
    this.setState({load: true})
    maker = await connect()
    getWeb3()
    this.setState({ maker: true })
  }
  
  render() {
    let connected = this.state.maker === true ? true : false
    return (
      <div className="App" >
        <h1>Dai Savings Rate Plugin Demo</h1>
        <p>In order to use this demo, you need to be connected to the Kovan Ethereum testnet through the <a href='https://metamask.io' target="_blanka">Metamask</a> browser extension, and have a small amount of ETH and Kovan Dai.</p>
        <p>If you do not have any Kovan Dai, go to <a href='https://oasis.app/borrow?network=kovan' target="_blanka">Oasis Borrow</a> and generate some using ETH</p>
        <p>This demo uses the <a href='https://changelog.makerdao.com/releases/kovan/1.0.1/contracts.json' target="_blanka" >Kovan 1.0.1 Release</a> of the Maker Protocol</p>
        <p>If you have not interacted with the Maker Protocol before, then you will be prompted to send a transaction to instantiate a proxy identity when you login with Metamask.</p>
        {
          connected ? <DsrDemo maker={maker} /> : (
            <MetaMaskButton.outline
              onClick={this.handleMetamask}
            >
              {this.state.load ? <Loader color='black'/> :'Connect With Metamask'}
            </MetaMaskButton.outline>
          )
        }        
      </div>
    );

  }
}

export default App;
