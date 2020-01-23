import React from 'react';
import { Flex, Card, Text, Button } from 'rimble-ui';
import { MDAI } from '@makerdao/dai-plugin-mcd';
import { approveProxyInDai } from '../utils/web3';


class DsrDemo extends React.Component {
    state = {
        ETH: "0.00 ETH",
        MDAI: "0.00 MDAI",
        DSR: "0.00 MDAI",
    }

    componentWillMount() {
        this.displayBalances();
        this.updateBalance();
    }


    displayBalances = async () => {
        let maker = this.props.maker;
        let ethBalance = await maker.getToken('ETH').balanceOf(maker.currentAddress())
        let MDAIBalance = await maker.getToken('MDAI').balanceOf(maker.currentAddress());
        let dsrManager = await maker.service('mcd:savings')
        let dsrBalance = await dsrManager.balance();
        this.setState({ ETH: ethBalance.toString(), MDAI: MDAIBalance.toString(), DSR: dsrBalance.toString()});
    }

    updateBalance = async () => {
        setInterval(async () => {
            this.displayBalances()
        }, 5000)
    }
    
    approveMDAI = async () => {
        await approveProxyInDai();
    }

    joinDsr = async () => {
        let maker = this.props.maker;
        let dsrManager = await maker.service('mcd:savings')
        await dsrManager.join(MDAI(1));
    }

    exitDsr = async () => {
        let maker = this.props.maker;
        let dsrManager = await maker.service('mcd:savings')
        await dsrManager.exit(MDAI(1));
    }

    exitAllDsr = async () => {
        let maker = this.props.maker;
        let dsrManager = await maker.service('mcd:savings')
        await dsrManager.exitAll();
    }

    render() {
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
                        <Text> {this.state.MDAI} </Text>

                    </Flex>
                    <Flex>

                        <Text> {this.state.DSR} in DSR </Text>
                    </Flex>
                </Card>
                <p>Use the buttons below to add and retrieve Dai from DSR.</p>
                <p>Step 1: Approve Dai</p>
                <Button size='small' onClick={this.approveMDAI}>Approve Dai</Button>
                <p>Step 2: Interact with DSR</p>
                <Button size='small' onClick={this.joinDsr}>Join 1 Dai to DSR</Button><p></p>
                <Button size='small' onClick={this.exitDsr}>Retrieve 1 Dai from DSR</Button> <p></p>
                <Button size='small' onClick={this.exitAllDsr}>Retrieve all Dai from DSR</Button><p></p>


            </div>
        )
    }
}

export default DsrDemo;