import { persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import * as reducers from './modules';

const config = {
  key: 'primary',
  storage,
  whitelist: ['session']
};

export default persistCombineReducers(config, {
  ...reducers
});
