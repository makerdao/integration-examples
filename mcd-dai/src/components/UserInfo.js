import React from 'react';
import { Flex, Card, Text, Loader, Button, Pill } from 'rimble-ui';
import { BAT, MDAI } from '@makerdao/dai-plugin-mcd';
import { requestTokens, approveProxyInBAT, approveProxyInDai, leverage, sell5Dai, buyDai } from '../utils/web3';

class UserInfo extends React.Component {
    state = {
        ETH: '',
        BAT: '0.00 BAT',
        MDAI: '0.00 MDAI',
        showFaucetButton: false,
        approveBAT: false,
        approveDAI: false,
        loadFaucet: false,
        payBack: false,
        lockBAT: false,
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
        let BATBalance = await maker.getToken('BAT').balanceOf(maker.currentAddress());
        let MDAIBalance = await maker.getToken('MDAI').balanceOf(maker.currentAddress());
        let showFaucetButton = BATBalance.toString() === '0.00 BAT' && MDAIBalance.toString() === '0.00 MDAI' ? true : false;
        this.setState({ ETH: ethBalance.toString(), BAT: BATBalance.toString(), MDAI: MDAIBalance.toString(), showFaucetButton });
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

    approveBAT = async () => {
        this.setState({ approveLock: true })
        await approveProxyInBAT()
        setTimeout(() => {
            this.setState({ approveLock: false, approveBAT: true })
        }, 20000);
    }

    lockCollateral = async () => {
        this.setState({ lockBAT: true })
        let maker = this.props.maker;
        let cdpManager = await maker.service('mcd:cdpManager');
        await cdpManager.openLockAndDraw('BAT-A', BAT(150), MDAI(20));
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
        await cdpManager.wipeAndFree(cdps[0].id, 'BAT-A', MDAI(20), BAT(150))
        this.setState({ approveBAT: false, approveDAI: false, lockBAT: false, payBack: false })
    }

    leverage = () => {
        leverage()
    }

    render() {
        let loadRequest = this.state.BAT === '0.00 BAT' && this.state.loadFaucet ? true : false;
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
                        <Text> {this.state.BAT}
                            {
                                this.state.showFaucetButton ?
                                    <Button size='small' onClick={this.requestTokensFromFaucet}>{loadRequest ? <Loader color='white' /> : 'Request BAT from faucet'}</Button> : ''
                            }
                        </Text>

                    </Flex>
                    <Flex>
                        <Text> {this.state.MDAI} </Text>
                    </Flex>
                </Card>
                {this.state.BAT === '0.00 BAT' ? '' :
                    this.state.BAT !== '150.00 BAT' ? <Pill color='red'>Acquire 150 BAT</Pill> :
                        (this.state.BAT === '150.00 BAT' && this.state.approveBAT === true
                            ?
                            <Button size='small'
                                onClick={this.lockCollateral}
                            >
                                {
                                    this.state.lockBAT === true && this.state.BAT === '150.00 BAT' ? <Loader color='white' /> : 'Lock 150 BAT and Draw 20 Dai'
                                }
                            </Button>
                            :
                            this.state.BAT === '0.00 BAT' && this.state.MDAI !== '0.00 MDAI' ? '' :
                                <Button size='small'
                                    onClick={this.approveBAT}
                                >
                                    {
                                        this.state.approveLock ? <Loader color='white' /> : 'Approve to lock BAT'
                                    }
                                </Button>
                        )

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
                                {this.state.MDAI === '20.00 MDAI' && this.state.payBack === true ? <Loader color='white' /> : 'Pay Back 20 MDAI'}
                            </Button>
                        : ''
                }
                <hr />
                <div>
                    <Button onClick={this.leverage} size="small">Try Leverage 1 200 0.1</Button>
                </div>
                <hr />
                <div>
                    <Button onClick={sell5Dai} size='small'>Sell 5 Dai</Button>
                </div>
                <div style={{margin: '5px'}}>
                    <Button onClick={buyDai} size='small'>Buy 5 Dai</Button>
                </div>
            </div>
        )
    }
}

export default UserInfo;