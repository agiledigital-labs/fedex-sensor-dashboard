import { createActions } from 'redux-actions';

const actions = createActions({
  DATA: {
    GET_TEMPERATURES: ({ room, deviceName, from, to }) => ({ room, deviceName, from, to }),
    SET_TEMPERATURES: ({ roomTemperatures }) => ({ roomTemperatures }),

    GET_HUMIDITY: ({ room, deviceName, from, to }) => ({ room, deviceName, from, to }),
    SET_HUMIDITY: ({ roomHumidity }) => ({ roomHumidity }),

    GET_DEVICES: undefined,
    SET_DEVICES: ({ devices }) => ({ devices }),

    GET_BUSYNESS: ({ room, deviceId, from, to }) => ({ room, deviceId, from, to }),
    SET_BUSYNESS: ({ roomBusyness }) => ({ roomBusyness }),

    GET_MOTIONS: ({ room, deviceId, from, to }) => ({ room, deviceId, from, to }),
    SET_MOTIONS: ({ roomMotions }) => ({ roomMotions }),
  }
});

export default actions;
