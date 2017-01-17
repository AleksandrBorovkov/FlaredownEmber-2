import Ember from 'ember';
import Resizable from './chart/resizable';
import Draggable from './chart/draggable';
import FieldsByUnits from 'flaredown/mixins/fields-by-units';

const { getProperties } = Ember;

export default Ember.Component.extend(Resizable, Draggable, FieldsByUnits, {
  classNames: ['health-chart'],

  endAt: moment(),
  checkins: [],
  trackables: [],
  flatHeight: 30,
  serieHeight: 75,
  seriePadding: 20,
  timelineHeight: 25,

  pressureUnits: Ember.computed.alias('session.currentUser.profile.pressureUnits'),
  timelineLength: Ember.computed.alias('timeline.length'),

  startAt: Ember.computed('SVGWidth', function() {
    if( this.get('SVGWidth') <= 500) {
      return moment().subtract(5, 'days');
    } else {
      return moment().subtract(15, 'days');
    }
  }),

  startAtWithCache: Ember.computed('startAt', function() {
    return moment(this.get('startAt')).subtract(15, 'days');
  }),

  endAtWithCache: Ember.computed('endAt', function() {
    return moment(this.get('endAt')).add(15, 'days');
  }),

  series: Ember.computed('trackables', 'pressureUnits', function() {
    const { flatHeight, serieHeight, seriePadding } = getProperties(this, 'flatHeight', 'serieHeight', 'seriePadding');

    let chartOffset = 0 - serieHeight - seriePadding;
    let series = {
      conditions: [],
      symptoms:   [],
      treatments: [],
      weathers_mesures: [],
    };

    this.get('trackables').forEach(item => {
      series[item.get('constructor.modelName').pluralize()].pushObject({ chartOffset: 0, model: item });
    });

    series.conditions.forEach(item => {
      item.chartOffset = chartOffset += serieHeight + seriePadding;
    });

    series.symptoms.forEach(item => {
      item.chartOffset = chartOffset += serieHeight + seriePadding;
    });

    series.treatments.forEach((item, index)  => {
      item.chartOffset = chartOffset += (index === 0 ? serieHeight : flatHeight) + seriePadding;
    });

    series.weathers_mesures.pushObject({
      name: 'Avg daily humidity',
      unit: '%',
      field: 'humidity',
      chartOffset: chartOffset += flatHeight + seriePadding,
    });

    series.weathers_mesures.pushObject({
      name: 'Avg daily atmospheric pressure',
      unit: this.get('pressureUnits'),
      field: this.pressureFieldByUnits(this.get('pressureUnits')),
      chartOffset: chartOffset += serieHeight + seriePadding,
    });

    return series;
  }),

  seriesLength: Ember.computed('series.weathers_mesures.length', 'trackables.length', function() {
    return this.get('trackables.length') + this.get('series.weathers_mesures.length');
  }),

  seriesWidth: Ember.computed('SVGWidth', function() {
    return this.get('SVGWidth') * 3;
  }),

  totalSeriesHeight: Ember.computed('series.weathers_mesures.[]', function() {
    return(
      this.get('series.weathers_mesures.lastObject.chartOffset')
      + this.get('serieHeight')
      + this.get('seriePadding')
    );
  }),

  timeline: Ember.computed('checkins', 'startAtWithCache', 'endAtWithCache', function() {
    var timeline = Ember.A();
    moment.range(this.get('startAtWithCache'), this.get('endAtWithCache') ).by('days', function(moment) {
      timeline.push(
        d3.time.format('%Y-%m-%d').parse(moment.format("YYYY-MM-DD"))
      );
    });
    return timeline;
  }),

  SVGHeight: Ember.computed('timelineLength', 'totalSeriesHeight', function() {
    if(Ember.isPresent(this.get('totalSeriesHeight'))) {
      return this.get('totalSeriesHeight') + this.get('timelineHeight') + this.get('seriePadding');
    } else {
      return this.get('timelineHeight') + this.get('seriePadding');
    }
  }),

  SVGWidth: Ember.computed('checkins',function() {
    return this.$().width();
  }),

  didInsertElement() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, () => {
      this.fetchDataChart().then( () => {
        this.set('chartLoaded', true);
      });
    });
  },

  fetchDataChart() {
    var startAt = this.get('startAtWithCache').format("YYYY-MM-DD");
    var endAt = this.get('endAtWithCache').format("YYYY-MM-DD");

    return this.store.queryRecord('chart', { id: 'health', start_at: startAt, end_at: endAt }).then( chart => {
      this.set('checkins', chart.get('checkins').sortBy('date:asc') );
      this.set('trackables', chart.get('trackables').sortBy('type'));
    });
  },

  onResizeEnd() {
    this.fetchDataChart();
  },

  onDragged(){
    this.fetchDataChart();
  },

  onDragging(direction){
    var nextStartAt, nextEndAt;

    if(Ember.isEqual('right', direction)) {
      this.set('startAt',  moment(this.get('startAt')).subtract(1, 'days'));
      this.set('endAt',  moment(this.get('endAt')).subtract(1, 'days'));

    } else if( Ember.isEqual('left', direction) ) {
      nextStartAt = moment(this.get('startAt')).add(1, 'days');
      nextEndAt = moment(this.get('endAt')).add(1, 'days');

      if( nextEndAt < moment().add(3, 'days') ) {
        this.set('startAt', nextStartAt );
        this.set('endAt',  nextEndAt );
      }
    }
  },

  actions: {
    setCurrentDate(date) {
      this.get('onDateClicked')(date);
    },

    openInfoWindow(date, xPosition) {
      this.set('xPosition', xPosition);
      this.set('openInfoWindow', true);
    },

    closeInfoWindow() {
      this.set('xPosition', null);
      this.set('openInfoWindow', false);
    },
  },
});
