import React from 'react';
import { Card, Text } from 'rimble-ui';
import { ETH, COL1, MDAI } from '@makerdao/dai-plugin-mcd';
import requestTokens from '../utils/web3';

class UserInfo extends React.Component {
    state = {
        ETH: '',
        COL1: ''
    }

    componentWillMount() {
        this.displayBalances();
    }

    displayBalances = async () => {
        let maker = this.props.maker;
        let token = maker.service('token');
        // let ethBalance = await maker.getToken('ETH').balanceOf(maker.currentAddress())
        let ethBalance = await maker.getToken('ETH').balanceOf(maker.currentAddress())
        // let col1Balance = await maker.getToken('COL1');
        // let daiBalance = await maker.getToken('MDAI').balance();
        // let col1Balance = await maker.service('token').getToken('COL1');
        // console.log('daiBalance', daiBalance);
        // console.log('col1Balance', col1Balance);
        
        // requestTokens()
        this.setState({ETH: ethBalance.toString()});
    }

    render() {
        console.log('this.state', this.state )
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
                    <Text> {this.state.COL1}</Text>
                </Card>
            </div>
        )
    }
}

export default UserInfo;