const initialState = {
	started: false
}

export default function App(state = initialState, action) {
  switch (action.type) {
    case 'START':
      return Object.assign({}, state, {
        started: true
      })
    default:
      return state
  }
}