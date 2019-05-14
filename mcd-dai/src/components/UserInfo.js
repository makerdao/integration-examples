import React from 'react';
import { Flex, Card, Text, Loader, Button } from 'rimble-ui';
import { COL1, MDAI } from '@makerdao/dai-plugin-mcd';
import { requestTokens, approveProxyInCOl1, approveProxyInDai } from '../utils/web3';


class UserInfo extends React.Component {
    state = {
        ETH: '',
        COL1: '0.00 COL1',
        MDAI: '0.00 MDAI',
        showFaucetButton: false,
        approveCOL1: false,
        approveDAI: false,
        loadFaucet: false,
        payBack: false,
        lockCOL1: false,
        approveWithdraw: false,
        approveLock: false,
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
            this.displayBalances()
        }, 5000)
    }

    requestTokensFromFaucet = () => {
        requestTokens()
        this.setState({ loadFaucet: true })
    }

    approveCOL1 = async () => {
        this.setState({ approveLock: true })
        await approveProxyInCOl1()
        setTimeout(() => {
            this.setState({ approveLock: false, approveCOL1: true })
        }, 20000);
    }

    lockCollateral = async () => {
        this.setState({ lockCOL1: true })
        let maker = this.props.maker;
        let cdpManager = await maker.service('mcd:cdpManager');
        await cdpManager.openLockAndDraw('COL1-A', COL1(50), MDAI(1));
    }

    approveMDAI = async () => {
        this.setState({ approveWithdraw: true })
        await approveProxyInDai();
        setTimeout(() => {
            this.setState({ approveWithdraw: false, approveDAI: true })
        }, 20000)
    }

    payBackCollateral = async () => {
        this.setState({ payBack: true })
        let maker = this.props.maker;
        let cdpManager = maker.service('mcd:cdpManager');
        let proxy = await maker.currentProxy();
        let cdps = await cdpManager.getCdpIds(proxy);
        await cdpManager.wipeAndFree(cdps[0].id, 'COL1-A', MDAI(1), COL1(50))
        this.setState({ approveCOL1: false, approveDAI: false, lockCOL1: false, payBack: false })
    }

    render() {
        let loadRequest = this.state.COL1 === '0.00 COL1' && this.state.loadFaucet ? true : false;
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
                    <Flex>
                        <Text> {this.state.COL1}
                            {
                                this.state.showFaucetButton ?
                                    <Button size='small' onClick={this.requestTokensFromFaucet}>{loadRequest ? <Loader color='white' /> : 'Request COL1 from faucet'}</Button> : ''
                            }
                        </Text>

                    </Flex>
                    <Flex>
                        <Text> {this.state.MDAI} </Text>
                    </Flex>
                </Card>
                {this.state.COL1 === '0.00 COL1' ? '' :
                    this.state.COL1 !== '0.00 COL1' && this.state.approveCOL1 === true
                        ?
                        <Button size='small'
                            onClick={this.lockCollateral}
                        >
                            {
                                this.state.lockCOL1 === true && this.state.COL1 === '50.00 COL1' ? <Loader color='white' /> : 'Lock 50 COL1'
                            }
                        </Button>
                        :
                        this.state.COL1 === '0.00 COL1' && this.state.MDAI !== '0.00 MDAI' ? '' :
                            <Button size='small'
                                onClick={this.approveCOL1}
                            >
                                {
                                    this.state.approveLock ? <Loader color='white' /> : 'Approve to lock COL1'
                                }
                            </Button>

                }
                {
                    this.state.MDAI !== '0.00 MDAI' && true ?
                        this.state.MDAI !== '0.00 MDAI' && this.state.approveDAI === false && true
                            ?
                            <Button size='small'
                                onClick={this.approveMDAI}
                            >
                                {
                                    this.state.approveWithdraw ? <Loader color='white' /> : 'Approve to withdraw MDAI'
                                }
                            </Button>
                            :
                            <Button size='small'
                                onClick={this.payBackCollateral}
                            >
                                {this.state.MDAI === '1.00 MDAI' && this.state.payBack === true ? <Loader color='white' /> : 'Pay Back 1 MDAI'}
                            </Button>
                        : ''
                }
            </div>
        )
    }
}

export default UserInfo;