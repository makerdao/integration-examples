import React from 'react';
import { Flex, Card, Text, Loader, Button, Pill } from 'rimble-ui';
import { BAT, MDAI } from '@makerdao/dai-plugin-mcd';
import { requestTokens, approveProxyInBAT, approveProxyInDai, leverage, sell5Dai, buyDai, defineNetwork, batAllowance, daiAllowance, doneInFaucet } from '../utils/web3';

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
        network: '',
        batIsApproved: false,
        daiIsApproved: false,
        doneInFaucet: true, 
        currentBatBalance: ''
    }

    UNSAFE_componentWillMount() {
        this.displayBalances();
        this.updateBalance();
        let networkId = window.ethereum.networkVersion
        let network = defineNetwork(networkId)
        this.checkApprovals()
        this.setState({ network: network.network })
    }

    displayBalances = async () => {
        let maker = this.props.maker;
        try {
            let ethBalance = await maker.getToken('ETH').balanceOf(maker.currentAddress())
            let BATBalance = await maker.getToken('BAT').balanceOf(maker.currentAddress());
            let MDAIBalance = await maker.getToken('MDAI').balanceOf(maker.currentAddress());
            this.allowedToGulp()
            let showFaucetButton = !this.state.doneInFaucet;
            let currentBatBalance = Number(BATBalance.toString().slice(0,-4))
            this.setState({ ETH: ethBalance.toString(), BAT: BATBalance.toString(), MDAI: MDAIBalance.toString(), showFaucetButton, currentBatBalance });
        } catch (error) {
            console.log(error);
        }
    }

    updateBalance = async () => {
        setInterval(async () => {
            this.displayBalances()
            this.checkApprovals()
            doneInFaucet()
        }, 2000)
    }

    requestTokensFromFaucet = () => {
        requestTokens()
        this.setState({ loadFaucet: true })
    }

    allowedToGulp = async () => {
        let done = await doneInFaucet();
        if (done) {
            this.setState({ doneInFaucet: true })
        } else {
            this.setState({ doneInFaucet: false })
        }
    }

    approveBAT = async () => {
        this.setState({ approveLock: true })
        await approveProxyInBAT()
        setTimeout(() => {
            this.checkApprovals()
            this.setState({ approveBAT: true })
        }, 12000);
        setTimeout(() => {
            this.checkApprovals()
        }, 20000)
    }

    lockCollateral = async () => {
        this.setState({ lockBAT: true })
        let maker = this.props.maker;
        let cdpManager = await maker.service('mcd:cdpManager');
        await cdpManager.openLockAndDraw('BAT-A', BAT(300), MDAI(20));
        setTimeout(() => {
            this.setState({lockBAT: false})
        },15000)
    }

    approveMDAI = async () => {
        this.setState({ approveWithdraw: true })
        await approveProxyInDai();
        setTimeout(() => {
            this.checkApprovals()
            this.setState({ approveDAI: true })
        }, 12000)
        setTimeout(() => {
            this.checkApprovals()
        }, 20000)
    }


    payBackCollateral = async () => {
        this.setState({ payBack: true })
        let maker = this.props.maker;
        let cdpManager = maker.service('mcd:cdpManager');
        let proxy = await maker.currentProxy();
        let cdps = await cdpManager.getCdpIds(proxy);
        await cdpManager.wipeAndFree(cdps[0].id, 'BAT-A', MDAI(20), BAT(300))
        this.setState({ payBack: false })
    }

    leverage = () => {
        leverage()
    }

    checkBatAllowance = async () => {
        const allowAmounnt = await batAllowance();
        if (allowAmounnt > 0) {
            this.setState({ batIsApproved: true })
        } else {
            this.setState({ batIsApproved: false })
        }

    }

    checkDaiAllowance = async () => {
        const allowAmounnt = await daiAllowance();
        if (allowAmounnt > 0) {
            this.setState({ daiIsApproved: true })
        } else {
            this.setState({ daiIsApproved: false })
        }
    }

    checkApprovals = () => {
        setTimeout(async () => {
            await this.checkBatAllowance()
            await this.checkDaiAllowance()
            this.allowedToGulp()
            if (this.state.batIsApproved) { this.setState({ approveLock: false }) }
            if (this.state.daiIsApproved) { this.setState({ approveWithdraw: false }) }
            if(this.state.doneInFaucet) {this.setState({loadFaucet: false})}
        }, 20)
    }

   

render() {
    let loadRequest = this.state.loadFaucet;
    let batBalance = Number(this.state.BAT.toString().slice(0, -4))
   
    return (
        <div>
            <Card width={'420px'} mx={'auto'} px={4}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text
                        caps
                        fontSize={0}
                        fontWeight={4}
                        mb={2}
                        alignItems={'center'}
                    >
                        Account Info:
                        </Text>
                    <Text
                        caps
                        fontSize={0}
                        fontWeight={4}
                        mb={1}
                        alignItems={'right'}
                    >
                        {` ${this.state.network} network`}
                    </Text>

                </div>
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
                this.state.batIsApproved ? '' :
                    <Button
                        m={1}
                        size='small'
                        onClick={this.approveBAT}
                    >
                        {
                            this.state.approveLock ? <Loader color='white' /> : 'Unlock BAT'
                        }
                    </Button>
            }
            {this.state.BAT === '0.00 BAT' ? '' :
                this.state.daiIsApproved ? '' :
                    <Button
                        m={1}
                        size='small'
                        onClick={this.approveMDAI}
                    >
                        {
                            this.state.approveWithdraw ? <Loader color='white' /> : 'Unlock Dai'
                        }
                    </Button>
            }

            {
            
                (Number(this.state.BAT.toString().slice(0, -4)) >= 300 && this.state.batIsApproved && this.state.daiIsApproved
                    ?
                    <Button 
                        m={1}
                        size='small'
                        onClick={this.lockCollateral}
                    >
                        {
                            this.state.lockBAT === true ? <Loader color='white' /> : 'Lock 300 BAT and Draw 20 Dai'
                        }
                    </Button>
                    :
                    ''
                )

            }
            {this.state.batIsApproved && this.state.daiIsApproved ?
                 
                    <Button 
                        m={1}
                        size='small'
                        onClick={this.payBackCollateral}
                    >
                        { this.state.payBack === true ? <Loader color='white' /> : 'Pay Back 20 MDAI'}
                    </Button>
                    : ''
            }
            {/* <hr /> */}
            {/* <div>
                    <Button onClick={this.leverage} size="small">Try Leverage 1 200 0.1</Button>
                </div> */}
            {/* <hr /> */}
            {/* <div>
                    <Button onClick={sell5Dai} size='small'>Sell 5 Dai</Button>
                </div>
                <div style={{ margin: '5px' }}>
                    <Button onClick={buyDai} size='small'>Buy 5 Dai</Button>
                </div> */}
        </div>
    )
}
}

export default UserInfo;