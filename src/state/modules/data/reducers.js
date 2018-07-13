import { handleActions } from 'redux-actions';
import dataActions from './actions';

export const initialState = {
  roomTemperatures: {},
  roomBusyness: {},
  roomMotions: {},
  roomHumidity: {},
  devices: []
};

const reducer = handleActions(
  {
    [dataActions.data.setTemperatures]: (state, action) => ({
      ...state,
      roomTemperatures: {
        ...state.roomTemperatures,
        ...action.payload.roomTemperatures
      }
    }),
    [dataActions.data.setHumidity]: (state, action) => ({
      ...state,
      roomHumidity: {
        ...state.roomHumidity,
        ...action.payload.roomHumidity
      }
    }),
    [dataActions.data.setMotions]: (state, action) => ({
      ...state,
      roomMotions: {
        ...state.roomMotions,
        ...action.payload.roomMotions
      }
    }),
    [dataActions.data.setDevices]: (state, action) => ({
      ...state,
      devices: action.payload.devices
    }),
    [dataActions.data.setBusyness]: (state, action) => ({
      ...state,
      roomBusyness: {
        ...state.roomBusyness,
        ...action.payload.roomBusyness
      }
    })
  },
  {
    ...initialState
  }
);

export default reducer;
