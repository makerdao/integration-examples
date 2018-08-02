import Maker from '@makerdao/makerdao-exchange-integration';

export const started = () => ({
  type: 'STARTED'
})

export const makerCreated = () => ({
  type: 'MAKER_CREATED'
})

export const cdpOpened = () => ({
  type: 'CDP_OPENED'
})

export const ethLocked = () => ({
  type: 'ETH_LOCKED'
})

export const daiDrawn = () => ({
  type: 'DAI_DRAWN'
})

export const daiWiped = () => ({
  type: 'DAI_WIPED'
})

export const cdpShut = () => ({
  type: 'CDP_SHUT'
})

const drawDaiAsync = (maker, cdp) => async dispatch => {
  const defaultAccount = maker.service('token').get('web3').defaultAccount();
  const dai = maker.service('token').getToken('DAI');
  const txn = await cdp.drawDai(.1);
  const balance = await dai.balanceOf(defaultAccount);
  console.log('Transaction from drawing Dai:', txn);
  console.log('Dai balance after drawing:', balance.toString());
  dispatch(daiDrawn());
}

const wipeDebtAsync = (maker, cdp) => async dispatch => {
  const defaultAccount = maker.service('token').get('web3').defaultAccount();
  const dai = maker.service('token').getToken('DAI');
  const txn = await cdp.wipeDai(.1);
  const balance = await dai.balanceOf(defaultAccount);

  console.log('Transaction from wiping Dai:', txn);
  console.log('Dai balance after wiping:', balance.toString());
  dispatch(daiWiped());
}

const shutCdpAsync = (cdp) => async dispatch => {
  const txn = await cdp.shut();
  console.log('Transaction from shutting the CDP:', txn);
  dispatch(cdpShut());
}


export const startAsync = () => async dispatch => {
    dispatch(started());
    const maker = new Maker('kovan', { privateKey: process.env.REACT_APP_PRIVATE_KEY, overrideMetamask: true });
    console.log('maker:', maker);
    dispatch(makerCreated());
    const cdp = await maker.openCdp();
    console.log('cdp:', cdp);
    dispatch(cdpOpened());
    const lockEthTx = await cdp.lockEth(0.01);
    console.log('transaction to lock eth:', lockEthTx);
    dispatch(ethLocked());
    await dispatch(drawDaiAsync(maker, cdp));
    await dispatch(wipeDebtAsync(maker,cdp));
    await dispatch(shutCdpAsync(cdp));
}
