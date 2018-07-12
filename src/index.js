import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'index.css';
import Routes from './routes';
import rootSaga from './state/rootSaga';
import { ConnectedRouter } from 'connected-react-router';
import store, { history } from './state/store';
import registerServiceWorker from 'registerServiceWorker';

rootSaga.run();

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Routes />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
