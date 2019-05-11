import React from 'react';
import { Card, Text } from 'rimble-ui';
import { ETH, COL1, MDAI } from '@makerdao/dai-plugin-mcd';
import { requestTokens, approveProxyInCOl1, approveProxyInDai } from '../utils/web3';


class UserInfo extends React.Component {
    state = {
        ETH: '',
        COL1: '0.00 COL1',
        MDAI: '0.00 MDAI',
        showFaucetButton: false,
        approveCOl1: false,
        approveDAI: false,
    }

    componentWillMount() {
        this.displayBalances();
        this.updateBalance();
    }


    displayBalances = async () => {
        let maker = this.props.maker;
        let ethBalance = await maker.getToken('ETH').balanceOf(maker.currentAddress())
        let col1Balance = await maker.getToken('COL1').balanceOf(maker.currentAddress());
        let MDAIBalance = await maker.getToken('MDAI').balanceOf(maker.currentAddress());
        let showFaucetButton = col1Balance.toString() === '0.00 COL1' && MDAIBalance.toString() === '0.00 MDAI' ? true : false;
        this.setState({ ETH: ethBalance.toString(), COL1: col1Balance.toString(), MDAI: MDAIBalance.toString(), showFaucetButton });
    }

    updateBalance = async () => {
        setInterval(async () => {
            console.log('updating')
            this.displayBalances()
        }, 5000)
    }

    requestTokensFromFaucet = () => {
        requestTokens()
    }

    approveCOL1 = async () => {
        await approveProxyInCOl1()
        this.setState({ approveCOl1: true })
    }

    lockCollateral = async () => {
        // await approveProxyInCOl1()
        let maker = this.props.maker;
        let cdpManager = await maker.service('mcd:cdpManager');
        await cdpManager.openLockAndDraw('COL1-A', COL1(50), MDAI(1));
    }

    approveMDAI = async () => {
        await approveProxyInDai();
        this.setState({approveDAI: true})
    }

    payBackCollateral = async () => {
        let maker = this.props.maker;
        let cdpManager = maker.service('mcd:cdpManager');
        let proxy = await maker.currentProxy();
        let cdps = await cdpManager.getCdpIds(proxy);
        await cdpManager.wipeAndFree(cdps[0].id, 'COL1-A', MDAI(1), COL1(50))
    }

    render() {
        console.log(this.state)
        return (
            <div>
                <Card width={'420px'} mx={'auto'} px={4}>
                    <Text
                        caps
                        fontSize={0}
                        fontWeight={4}
                        mb={3}
                        display={'flex'}
                        alignItems={'center'}
                    >
                        Account Info:
                     </Text>
                    <Text>{this.props.maker.currentAddress()}</Text>
                    <Text> {this.state.ETH}</Text>
                    <Text> {this.state.COL1}
                        {
                            this.state.showFaucetButton ?
                                <span>  <button onClick={this.requestTokensFromFaucet}>Request COL1 from faucet</button></span> : ''
                        }
                    </Text>
                    <Text> {this.state.MDAI}</Text>
                </Card>

                {
                    this.state.COL1 !== '0.00 COL1' && this.state.approveCOl1 === true
                        ?
                        <button
                            onClick={this.lockCollateral}
                        >
                            Lock 50 COL1
                        </button>
                        :
                        this.state.COL1 === '0.00 COL1' && this.state.MDAI !== '0.00 MDAI' ? '' :
                        <button
                            onClick={this.approveCOL1}
                        >
                            Approve to lock COL1
                        </button>

                }                
                {
                    this.state.MDAI !== '0.00 MDAI' ?
                    this.state.MDAI !== '0.00 MDAI' && this.state.approveDAI === false
                        ?
                        <button
                            onClick={this.approveMDAI}
                        >
                            Approve to withdraw 
                        </button>
                        :
                        
                        <button
                            onClick={this.payBackCollateral}
                        >
                            Pay Back 1 MDAI
                        </button>
                        :  ''
                }
            </div>
        )
    }
}

export default UserInfo;