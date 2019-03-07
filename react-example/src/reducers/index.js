const initialState = {
  started: false
}

export default function App(state = initialState, action) {
  switch (action.type) {
    case 'STARTED':
      return {
        started: true
      }
    case 'MAKER_CREATED':
      return Object.assign({}, state, {
        maker_created: true
      })
    case 'CDP_OPENED':
      return Object.assign({}, state, {
        cdp_opened: true
      })
    case 'ETH_LOCKED':
      return Object.assign({}, state, {
        eth_locked: true
      })
    case 'DAI_DRAWN':
      return Object.assign({}, state, {
        dai_drawn: true
      })
    case 'DAI_WIPED':
      return Object.assign({}, state, {
        dai_wiped: true
      })
    case 'CDP_SHUT':
      return Object.assign({}, state, {
        cdp_shut: true
      })
    default:
      return state
  }
}
