import Maker from '@makerdao/makerdao-exchange-integration';

export const start = () => ({
  type: 'START'
})

export const createMaker = () => ({
  type: 'CREATE_MAKER'
})

export const openCdp = () => ({
  type: 'OPEN_CDP'
})

export const getCdpId = () => ({
  type: 'GET_CDP_ID'
})

export const createCdpWrapperWithId = () => ({
  type: 'CREATE_WRAPPER'
})

export const lockEth = () => ({
  type: 'LOCK_ETH'
})

export const drawDai = () => ({
  type: 'DRAW_DAI'
})

export const wipeDai = () => ({
  type: 'WIPE_DAI'
})

export const shutCdp = () => ({
  type: 'SHUT_CDP'
})

export const error = (error) => ({
  type: 'ERROR',
  error
})

const drawDaiAsync = (maker, cdp) => async dispatch => {
  const defaultAccount = maker.service('token').get('web3').defaultAccount();
  const dai = maker.service('token').getToken('DAI');
  const txn = await cdp.drawDai(.1);
  const balance = await dai.balanceOf(defaultAccount);
  console.log('Transaction from drawing Dai:', txn);
  console.log('Dai balance after drawing:', balance.toString());
  dispatch(drawDai());
}

const wipeDebtAsync = (maker, cdp) => async dispatch => {
  console.log('in wipe dai');
  const defaultAccount = maker.service('token').get('web3').defaultAccount();
  const dai = maker.service('token').getToken('DAI');
  const txn = await cdp.wipeDai(.1);
  const balance = await dai.balanceOf(defaultAccount);

  console.log('Transaction from wiping Dai:', txn);
  console.log('Dai balance after wiping:', balance.toString());
  dispatch(wipeDai());
}

const shutCdpAsync = (cdp) => async dispatch => {
  const txn = await cdp.shut();
  console.log('Transaction from shutting the CDP:', txn);
  dispatch(shutCdp());
}


export const startAsync = () => async dispatch => {
    dispatch(start());
    const maker = new Maker('kovan', { privateKey: process.env.REACT_APP_PRIVATE_KEY, overrideMetamask: true });
    dispatch(createMaker());
    const cdp = await maker.openCdp();
    dispatch(openCdp());
    await cdp.lockEth(0.01);
    dispatch(lockEth());
    await dispatch(drawDaiAsync(maker, cdp));
    await dispatch(wipeDebtAsync(maker,cdp));
    await dispatch(shutCdpAsync(cdp));
}
