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

export const startAsync = () => async dispatch => {
    dispatch(start());
    const maker = new Maker('kovan', { privateKey: process.env.REACT_APP_PRIVATE_KEY, overrideMetamask: true });
    dispatch(createMaker());
    const cdp = await maker.openCdp();
    dispatch(openCdp());
    await cdp.lockEth(0.01);
    dispatch(lockEth());
}
