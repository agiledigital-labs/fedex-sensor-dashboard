import { handleActions } from 'redux-actions';
import dataActions from './actions';

export const initialState = {
  roomTemperatures: {},
  roomBusyness: {},
  roomMotions: {},
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
