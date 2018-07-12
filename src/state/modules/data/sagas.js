import { all, takeLatest, call, put, takeEvery } from 'redux-saga/effects';
import fp from 'lodash/fp';
import moment from 'moment';
import dataActions from './actions';

export const temperatureSeriesType = 'temperature';
export const motionSeriesType = 'motion';

function* fetchTemperatures(action) {
  const temperatures = yield call(apiFetchTemp, action.payload.deviceName, action.payload.from, action.payload.to);

  const roomTemperatures = {
    [action.payload.deviceName]: {
      room: action.payload.room,
      name: action.payload.deviceName,
      type: temperatureSeriesType,
      columns: ['time', 'value'],
      latest: fp.last(temperatures),
      points: fp.map(t => ([moment(t.time).valueOf(), t.value]))(temperatures)
    }
  };

  yield put(dataActions.data.setTemperatures({ roomTemperatures }));
}

function* fetchMotions(action) {
  const motions = yield call(apiFetchMotions, action.payload.deviceId, action.payload.from, action.payload.to);

  const roomMotions = {
    [action.payload.deviceId]: {
      room: action.payload.room,
      name: action.payload.deviceId,
      type: motionSeriesType,
      columns: ['time', 'value'],
      latest: fp.last(motions),
      points: fp.map(t => ([moment(t.time).valueOf(), t.value]))(motions)
    }
  };

  yield put(dataActions.data.setMotions({ roomMotions }));
}

function* fetchBusyness(action) {
  try {
    const busyness = yield call(apiFetchBusyness, action.payload.deviceId, action.payload.from, action.payload.to);

    const roomBusyness = {
      [action.payload.deviceId]: {
        room: action.payload.room,
        deviceId: action.payload.deviceId,
        busyness
      }
    };

    yield put(dataActions.data.setBusyness({ roomBusyness }));
  }
  catch (err) {
    console.log(err);
  }
}

function* fetchDevices() {
  const devices = yield call(apiFetchDevices);

  const grouped = fp.groupBy(d => d.room)(devices);

  yield put(dataActions.data.setDevices({ devices: grouped }));
}

const apiFetchTemp = (deviceName, from, to) => {
  return fetch(`https://fedex-sensor-api.staging.agiledigital.co/temperature?deviceName=${deviceName}&type=list&from=${from}&to=${to}`, {
    headers: {
      'content-type': 'application/json'
    },
    method: 'GET',
    cors: true
  })
    .then(result => result.json())
    .then(json => json.result);
};

const apiFetchMotions = (deviceId, from, to) => {
  return fetch(`https://fedex-sensor-api.staging.agiledigital.co/motion?deviceId=${deviceId}&type=list&from=${from}&to=${to}`, {
    headers: {
      'content-type': 'application/json'
    },
    method: 'GET',
    cors: true
  })
    .then(result => result.json())
    .then(json => json.result);
};

const apiFetchBusyness = (deviceId, from, to) => {
  return fetch(`https://fedex-sensor-api.staging.agiledigital.co/busyness?deviceId=${deviceId}&from=${from}&to=${to}`, {
    headers: {
      'content-type': 'application/json'
    },
    method: 'GET',
    cors: true
  })
    .then(result => result.json())
    .then(json => json.result);
};

const apiFetchDevices = () => {
  return fetch('https://fedex-sensor-api.staging.agiledigital.co/devices', {
    headers: {
      'content-type': 'application/json'
    },
    method: 'GET',
    cors: true
  })
    .then(result => result.json())
    .then(json => json.result);
};


function* dataSagas() {
  yield all([
    takeEvery(dataActions.data.getTemperatures, fetchTemperatures),
    takeEvery(dataActions.data.getBusyness, fetchBusyness),
    takeEvery(dataActions.data.getMotions, fetchMotions),
    takeLatest(dataActions.data.getDevices, fetchDevices)
  ]);
}

export default dataSagas;
