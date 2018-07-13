import React from 'react';
import { connect } from 'react-redux';
import fp from 'lodash/fp';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import './App.css';
import { compose, lifecycle, withStateHandlers, withHandlers } from 'recompose';
import { Charts, ChartContainer, ChartRow, YAxis, EventMarker, styler, AreaChart } from 'react-timeseries-charts';
import { TimeSeries } from 'pondjs';
import { dataActions } from './state/modules/data';
import { Typography, CardHeader, AppBar, Toolbar, Button } from '@material-ui/core';
import { temperatureSeriesType, motionSeriesType, humiditySeriesType } from './state/modules/data/sagas';

const editOverlay = false;

const degree = '\u00B0C';

const floorDisplays = {
  temperature: 'temperature',
  busyness: 'busyness'
};

const floorPlanPoints = {
  'Board Room': [
    { x: 60.01388888888889, y: 46.81517967145795 },
    { x: 63.84722222222224, y: 54.0959702258726 },
    { x: 79.12499999999973, y: 54.58781827515396 },
    { x: 79.40277777777769, y: 39.728588295687786 },
    { x: 65.70833333333333, y: 39.187099589322344 }
  ],
  'Reception': [
    { x: 60.01388888888891, y: 18.699804928131428 },
    { x: 79.11111111111093, y: 18.630595482546227 },
    { x: 79.19444444444437, y: 39.20666837782339 },
    { x: 60.23611111111112, y: 39.22007700205348 }
  ],
  'Kitchenette': [
    { x: 9.169309833447405, y: 15.987669404517527 },
    { x: 9.041666666666686, y: 5.537843942505124 },
    { x: 22.0972222222219, y: 5.629327515400454 },
    { x: 22.111111111110933, y: 18.317351129363534 },
    { x: 9.333333333333293, y: 19.274050308008402 }
  ],
  'Middle Office': [
    { x: 14.666666666666679, y: 24.61284394250512 },
    { x: 43.972222222221944, y: 18.754327515400462 },
    { x: 45.861111111110965, y: 45.61735112936348 },
    { x: 21.34722222222222, y: 54.099050308008366 }
  ],
  'Outside': [
    { x: 22.44444444444445, y: 5.450343942505114 },
    { x: 22.319444444444446, y: 18.311550308008385 },
    { x: 79.4722222222221, y: 18.317351129363455 },
    { x: 79.59722222222192, y: 5.4543275154004505 }
  ]
};

const d3 = window.d3;

const TemperatureSensorType = 'Temperature Sensor';
const MotionSensorType = 'Motion Sensor';
const HumiditySensorType = 'Humidity Sensor';

const motionLineStyle = styler([
  {
    key: 'value',
    color: "#f44242",
    selected: "#f44242"
  }
]);

const tempLineStyle = styler([
  {
    key: 'value',
    color: "#760dbc",
    selected: "#760dbc"
  }
]);

const humLineStyle = styler([
  {
    key: 'value',
    color: "#0d18bc",
    selected: "#0d18bc"
  }
]);

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    height: 140,
    width: 100,
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
  floorPlan: {
    margin: 'auto',
    width: '1200px'
  },
  container: {
    width: 1800,
    margin: 'auto'
  },
  buttonControls: {
    width: 350,
    margin: 'auto',
    marginBottom: 20
  },
  controlButton: {
    marginRight: 10
  },
  dateControl: {
    marginTop: 20
  }
});

const renderMarker = (trackerEvent, label, trackerValue, axis) => {
  return (
    <EventMarker
      type='flag'
      axis={axis}
      event={trackerEvent}
      info={
        [
          {
            label,
            value: trackerValue
          }
        ]
      }
      infoTimeFormat={(d) => moment(d).format('HH:mm')}
      infoWidth={120}
      markerRadius={2}
      markerStyle={{ fill: 'black' }}
    />
  );
};

const Chart = compose(
  withStateHandlers(
    {
      highlight: {},
      selection: {},
      trackerValue: '',
      trackerEvent: null,
      tracker: null,
      trackerType: ''
    },
    {
      setHighlight: () => (highlight) => ({ highlight }),
      setSelection: () => (selection) => ({ selection }),
      setTracker: () => (eventTime, v, e, trackerType) => ({
        tracker: eventTime,
        trackerValue: v,
        trackerEvent: e,
        trackerType
      })
    }
  ),
  withHandlers({
    handleTrackerChanged: ({ setTracker }) => (type, series, t) => {
      if (t) {
        const e = series.atTime(t);
        const eventTime = new Date(
          e.begin().getTime() + (e.end().getTime() - e.begin().getTime()) / 2
        );
        const eventValue = e.get('value');
        const v = `${eventValue > 0 ? '' : '-'}${eventValue}`;
        setTracker(eventTime, v, e, type);
      }
      else {
        setTracker(null, null, null);
      }
    }
  })
)(({ series, handleTrackerChanged, tracker, trackerEvent, trackerValue, trackerType }) => {
  const tempAxis = `${series.name}-temperature`;
  const motionAxis = `${series.name}-motion`;
  const humidityAxis = `${series.name}-humidity`;

  const tempSeries = series.series[temperatureSeriesType] && series.series[temperatureSeriesType].series;
  const tempRange = series.series[temperatureSeriesType] && series.series[temperatureSeriesType].range;

  const motionSeries = series.series[motionSeriesType] && series.series[motionSeriesType].series;
  const motionRange = series.series[motionSeriesType] && series.series[motionSeriesType].range;

  const humiditySeries = series.series[humiditySeriesType] && series.series[humiditySeriesType].series;
  const humidityRange = series.series[humiditySeriesType] && series.series[humiditySeriesType].range;

  return (
    <div>
      {
        tempSeries && tempRange ?
          <ChartContainer
            timeRange={tempRange}
            format={(d) => moment(d).format('HH:mm')}
            width={800}
            onTrackerChanged={(t) => handleTrackerChanged(temperatureSeriesType, tempSeries, t)}>
            <ChartRow height='200'>
              <YAxis
                id={tempAxis}
                label='Temperature'
                min={tempSeries.min()}
                max={tempSeries.max()}
                width='60'
                format={(d) => `${d}${degree}`}
              />
              <Charts>
                <AreaChart
                  style={tempLineStyle}
                  axis={tempAxis}
                  series={tempSeries}
                />
                {tracker && trackerType === temperatureSeriesType ?
                  renderMarker(trackerEvent, 'Temp', `${trackerValue}${degree}`, tempAxis) : <EventMarker />}
              </Charts>
            </ChartRow>
          </ChartContainer> : null
      }
      {
        humiditySeries && humidityRange ?
          <ChartContainer
            timeRange={humidityRange}
            format={(d) => moment(d).format('HH:mm')}
            width={800}
            onTrackerChanged={(t) => handleTrackerChanged(humiditySeriesType, humiditySeries, t)}>
            <ChartRow height='200'>
              <YAxis
                id={humidityAxis}
                label='Humidity'
                min={humiditySeries.min()}
                max={humiditySeries.max()}
                width='60'
                format={(d) => `${d}%`}
              />
              <Charts>
                <AreaChart
                  style={humLineStyle}
                  axis={humidityAxis}
                  series={humiditySeries}
                />
                {tracker && trackerType === humiditySeriesType ?
                  renderMarker(trackerEvent, 'Humidity', `${trackerValue}%`, humidityAxis) : <EventMarker />}
              </Charts>
            </ChartRow>
          </ChartContainer> : null
      }
      {
        motionSeries && motionRange ?
          <ChartContainer
            timeRange={motionRange}
            format={(d) => moment(d).format('HH:mm')}
            width={800}
            onTrackerChanged={(t) => handleTrackerChanged(motionSeries, t)}>
            <ChartRow height='200'>
              <YAxis
                id={motionAxis}
                label='Motion'
                min={motionSeries.min()}
                max={motionSeries.max()}
                width='60'
                format={(d) => {
                  if (d === 0) {
                    return 'No';
                  }
                  else if (d === 1) {
                    return 'Yes'
                  }
                  return '';
                }}
              />
              <Charts>
                <AreaChart
                  style={motionLineStyle}
                  axis={motionAxis}
                  series={motionSeries}
                />
              </Charts>
            </ChartRow>
          </ChartContainer> : null
      }
    </div>
  );
});

/**
 * Temperatures from now to 1 day ago.
 */
const refreshTemperatures = (room, deviceName, fetchTemperatures) => {
  fetchTemperatures({
    room,
    deviceName,
    from: moment().subtract(1, 'day').toISOString(),
    to: moment().toISOString()
  });
  setTimeout(() => refreshTemperatures(room, deviceName, fetchTemperatures), 60 * 1000);
}

/**
 * Humidity from now to 1 day ago.
 */
const refreshHumidity = (room, deviceName, fetchHumidity) => {
  fetchHumidity({
    room,
    deviceName,
    from: moment().subtract(1, 'day').toISOString(),
    to: moment().toISOString()
  });
  setTimeout(() => refreshTemperatures(room, deviceName, fetchHumidity), 60 * 1000);
}

/**
 * Motions from now to 1 day ago.
 */
const refreshMotions = (room, deviceId, fetchMotions) => {
  fetchMotions({
    room,
    deviceId,
    from: moment().subtract(1, 'day').toISOString(),
    to: moment().toISOString()
  });
  setTimeout(() => refreshTemperatures(room, deviceId, fetchMotions), 60 * 1000);
}

/**
 * Busyness from now to 30 minutes ago.
 */
const refreshBusyness = (room, deviceId, fetchBusyness) => {
  fetchBusyness({
    room,
    deviceId,
    from: moment().subtract(30, 'minute').toISOString(),
    to: moment().toISOString()
  });
  setTimeout(() => refreshBusyness(room, deviceId, fetchBusyness), 60 * 1000);
}

const refreshFloorPlan = (roomTemperatures, roomBusyness, display) => {
  let floorData = {};

  const xscale = d3.scale.linear()
    .domain([0, 50])
    .range([0, 720]);
  const yscale = d3.scale.linear()
    .domain([0, 35])
    .range([0, 400]);
  const map = d3.floorplan().xScale(xscale).yScale(yscale);
  const imagelayer = d3.floorplan.imagelayer();
  const heatmap = d3.floorplan.heatmap();
  const overlays = d3.floorplan.overlays().editMode(editOverlay);

  if (display === floorDisplays.temperature) {
    floorData = {
      heatmap: {
        binSize: 6,
        units: degree,
        map: fp.flow(
          fp.filter(rt => floorPlanPoints[rt.room]),
          fp.map(rt => ({
            value: rt.latest.value,
            points: floorPlanPoints[rt.room]
          }))
        )(roomTemperatures)
      },
      overlays: {
        polygons:
          fp.flow(
            fp.filter(rt => floorPlanPoints[rt.room]),
            fp.map(rt => ({
              id: rt.room + rt.deviceName,
              name: rt.room,
              points: floorPlanPoints[rt.room]
            }))
          )(roomTemperatures)
      }
    };

    heatmap.colorMode('custom').customThresholds([0, 10, 15, 20, 25, 30]);
  }

  if (display === floorDisplays.busyness) {
    floorData = {
      heatmap: {
        binSize: 6,
        units: '%',
        map: fp.flow(
          fp.filter(rb => floorPlanPoints[rb.room]),
          fp.map(rb => ({
            value: rb.busyness.toFixed(2) * 100,
            points: floorPlanPoints[rb.room]
          }))
        )(roomBusyness)
      },
      overlays: {
        polygons:
          fp.flow(
            fp.filter(rb => floorPlanPoints[rb.room]),
            fp.map(rb => ({
              id: rb.room + rb.deviceName,
              name: rb.room,
              points: floorPlanPoints[rb.room]
            }))
          )(roomBusyness)
      }
    };

    heatmap.colorMode('custom').customThresholds([50, 100]);
  }

  const mapdata = {};

  mapdata[imagelayer.id()] = [{
    url: 'braddon-floor-plan.png',
    x: 0,
    y: 0,
    height: 60,
    width: 80
  }];

  map.addLayer(imagelayer)
    .addLayer(heatmap)
    .addLayer(overlays);

  mapdata[heatmap.id()] = floorData.heatmap;
  mapdata[overlays.id()] = floorData.overlays;

  d3.select('svg').remove();

  d3.select('#demo')
    .append('svg')
    .attr('height', 700)
    .attr('width', 1200)
    .datum(mapdata)
    .call(map);
}

const mapStateToProps = (state) => ({
  data: state.data
});

const mapDispatchToProps = (dispatch) => ({
  fetchTemperatures: bindActionCreators(dataActions.data.getTemperatures, dispatch),
  fetchDevices: bindActionCreators(dataActions.data.getDevices, dispatch),
  fetchBusyness: bindActionCreators(dataActions.data.getBusyness, dispatch),
  fetchMotions: bindActionCreators(dataActions.data.getMotions, dispatch),
  fetchHumidity: bindActionCreators(dataActions.data.getHumidity, dispatch)
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withStateHandlers(
    {
      startedRefresh: false,
      floorDisplay: 'temperature'
    },
    {
      startRefresh: () => () => ({ startedRefresh: true }),
      setFloorDisplay: () => (display) => ({ floorDisplay: display })
    }
  ),
  lifecycle({
    componentDidMount() {
      const { fetchDevices } = this.props;
      fetchDevices();
    },
    componentWillReceiveProps({ data, fetchTemperatures, fetchBusyness, fetchMotions, startedRefresh, startRefresh, fetchHumidity }) {
      if (!startedRefresh) {
        startRefresh();
        fp.forEach(room => {
          const sensors = data.devices[room];
          const temperatureSensor = fp.find(s => s.sensor_type === TemperatureSensorType)(sensors);
          const motionSensor = fp.find(s => s.sensor_type === MotionSensorType)(sensors);
          const humiditySensor = fp.find(s => s.sensor_type === HumiditySensorType)(sensors);

          if (temperatureSensor) {
            refreshTemperatures(room, temperatureSensor.friendly_name, fetchTemperatures);
          }

          if (motionSensor) {
            refreshBusyness(room, motionSensor.deviceId, fetchBusyness);
            refreshMotions(room, motionSensor.deviceId, fetchMotions);
          }

          if (humiditySensor) {
            refreshHumidity(room, humiditySensor.friendly_name, fetchHumidity);
          }
        })(Object.keys(data.devices));
      }
    }
  })
)(({ classes, data, floorDisplay, setFloorDisplay }) => {
  const allData = fp.groupBy(d => d.room)({ ...data.roomTemperatures, ...data.roomMotions, ...data.roomHumidity });
  const allSeries = fp.map(room => {
    const tempTypeData = fp.find(d => d.type === temperatureSeriesType)(allData[room]);
    const motionTypeData = fp.find(d => d.type === motionSeriesType)(allData[room]);
    const humidityTypeData = fp.find(d => d.type === humiditySeriesType)(allData[room]);

    let series = {};

    if (tempTypeData) {
      const tempSeries = new TimeSeries(tempTypeData);
      series[temperatureSeriesType] = {
        series: tempSeries,
        range: tempSeries.range()
      }
    }

    if (motionTypeData) {
      const motionSeries = new TimeSeries(motionTypeData);
      series[motionSeriesType] = {
        series: motionSeries,
        range: motionSeries.range()
      }
    }

    if (humidityTypeData) {
      const humiditySeries = new TimeSeries(humidityTypeData);
      series[humiditySeriesType] = {
        series: humiditySeries,
        range: humiditySeries.range()
      }
    }

    return {
      room: room,
      series
    };
  })(Object.keys(allData));

  refreshFloorPlan(data.roomTemperatures, data.roomBusyness, floorDisplay);

  return (
    <div>
      <AppBar position='static' color='default'>
        <Toolbar>
          <Typography variant='title' color='inherit'>
            Braddon Office
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.container}>
        <div id='demo' className={classes.floorPlan}></div>
        <div className={classes.buttonControls}>
          <Button className={classes.controlButton} color='primary' variant='contained' onClick={() => setFloorDisplay(floorDisplays.temperature)}>
            Temperature
          </Button>

          <Button color='secondary' variant='contained' onClick={() => setFloorDisplay(floorDisplays.busyness)}>
            Busyness
          </Button>
        </div>
        <Grid container className={classes.root} spacing={24}>
          {
            fp.map(s => (
              <Grid
                item
                xs={6}
                key={s.room + s.name}>
                <Card className={classes.card}>
                  <CardContent>
                    <CardHeader
                      title={
                        <Typography variant='title'>
                          Location: {s.room}
                        </Typography>
                      }
                    />
                    <Chart series={s} />
                  </CardContent>
                </Card>
              </Grid>
            ))(allSeries)
          }
        </Grid>
      </div>
    </div>
  );
});
