import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { createStore } from 'redux';
import rootReducer from './reducers';

const store = createStore(rootReducer);

const unsubscribe = store.subscribe(() =>
  console.log(store.getState())
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();
