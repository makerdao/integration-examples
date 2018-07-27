const initialState = {
	started: false
}

export default function App(state = initialState, action) {
  switch (action.type) {
    case 'START':
      return {
        started: true
      }
    case 'CREATE_MAKER':
    	return Object.assign({}, state, {
    		maker_created: true
    	})
    case 'OPEN_CDP':
    	return Object.assign({}, state, {
    		cdp_opened: true
   		})
   	case 'LOCK_ETH':
   		return Object.assign({}, state, {
   			eth_locked: true
   		})
    default:
      return state
  }
}