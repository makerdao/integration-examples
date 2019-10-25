import React from 'react';
import { Flex, Card, Text, Loader, Button } from 'rimble-ui';
import { REP, MDAI } from '@makerdao/dai-plugin-mcd';
import { requestTokens, approveProxyInREP, approveProxyInDai, leverage } from '../utils/web3';


class UserInfo extends React.Component {
    state = {
        ETH: '',
        REP: '0.00 REP',
        MDAI: '0.00 MDAI',
        showFaucetButton: false,
        approveREP: false,
        approveDAI: false,
        loadFaucet: false,
        payBack: false,
        lockREP: false,
        approveWithdraw: false,
        approveLock: false,
    }

    UNSAFE_componentWillMount() {
        this.displayBalances();
        this.updateBalance();
    }


    displayBalances = async () => {
        let maker = this.props.maker;
        let ethBalance = await maker.getToken('ETH').balanceOf(maker.currentAddress())
        let REPBalance = await maker.getToken('REP').balanceOf(maker.currentAddress());
        let MDAIBalance = await maker.getToken('MDAI').balanceOf(maker.currentAddress());
        let showFaucetButton = REPBalance.toString() === '0.00 REP' && MDAIBalance.toString() === '0.00 MDAI' ? true : false;
        this.setState({ ETH: ethBalance.toString(), REP: REPBalance.toString(), MDAI: MDAIBalance.toString(), showFaucetButton });
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

    approveREP = async () => {
        this.setState({ approveLock: true })
        await approveProxyInREP()
        setTimeout(() => {
            this.setState({ approveLock: false, approveREP: true })
        }, 20000);
    }

    lockCollateral = async () => {
        this.setState({ lockREP: true })
        let maker = this.props.maker;
        let cdpManager = await maker.service('mcd:cdpManager');
        await cdpManager.openLockAndDraw('REP-A', REP(50), MDAI(10));
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
        await cdpManager.wipeAndFree(cdps[0].id, 'REP-A', MDAI(10), REP(50))
        this.setState({ approveREP: false, approveDAI: false, lockREP: false, payBack: false })
    }

    leverage = () => {
        leverage()
    }

    render() {
        let loadRequest = this.state.REP === '0.00 REP' && this.state.loadFaucet ? true : false;
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
                        <Text> {this.state.REP}
                            {
                                this.state.showFaucetButton ?
                                    <Button size='small' onClick={this.requestTokensFromFaucet}>{loadRequest ? <Loader color='white' /> : 'Request REP from faucet'}</Button> : ''
                            }
                        </Text>

                    </Flex>
                    <Flex>
                        <Text> {this.state.MDAI} </Text>
                    </Flex>
                </Card>
                {this.state.REP === '0.00 REP' ? '' :
                    this.state.REP !== '0.00 REP' && this.state.approveREP === true
                        ?
                        <Button size='small'
                            onClick={this.lockCollateral}
                        >
                            {
                                this.state.lockREP === true && this.state.REP === '50.00 REP' ? <Loader color='white' /> : 'Lock 50 REP and Draw 10 Dai'
                            }
                        </Button>
                        :
                        this.state.REP === '0.00 REP' && this.state.MDAI !== '0.00 MDAI' ? '' :
                            <Button size='small'
                                onClick={this.approveREP}
                            >
                                {
                                    this.state.approveLock ? <Loader color='white' /> : 'Approve to lock REP'
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
                                {this.state.MDAI === '10.00 MDAI' && this.state.payBack === true ? <Loader color='white' /> : 'Pay Back 10 MDAI'}
                            </Button>
                        : ''
                }
                <hr />
                <div>
                    <Button onClick={this.leverage} size="small">Try Leverage 1 400 0.1</Button>
                </div>
            </div>
        )
    }
}

export default UserInfo;