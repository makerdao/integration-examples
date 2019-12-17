import React from 'react';
import UserInfo from './components/UserInfo'
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
        <h1>MakerDAO Dai MCD Plugin Demo</h1>
        <p>For this demo: use kovan network and have some ETH</p>
        <p>This is based on the <a href='https://changelog.makerdao.com/releases/kovan/1.0.1/contracts.json' target="_blanka" >Kovan 1.0.1 Release</a></p>
        <p>In order to successfuly generate Dai from your BAT position, you need at least 150 BAT to generate at least 20 Dai. <br/>
          Currently the Faucet can only give 50 BAT/address. Until it's fixed, request BAT from different addresses and gather them all in one address to use this demo.
        </p>
        {
          connected ? <UserInfo maker={maker} /> : (
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
