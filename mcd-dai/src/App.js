import React from 'react';
import UserInfo from './components/UserInfo'
import './App.css';
import { MetaMaskButton } from 'rimble-ui'
import { connect, getWeb3 } from './utils/web3';


let maker = null;

class App extends React.Component {
  state = {
    maker: 'false'
  }
  handleMetamask = async () => {
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
