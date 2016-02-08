/* global d3, moment */
import Ember from 'ember';
import Resizable from './chart/resizable';
import Draggable from './chart/draggable';

export default Ember.Component.extend(Resizable, Draggable, {
  classNames: ['health-chart'],

  store: Ember.inject.service(),

  checkins: [],
  trackables: [],

  startAt: moment().subtract(15, 'days'),
  endAt: moment(),

  startAtWithCache: Ember.computed('startAt', function() {
    return moment(this.get('startAt')).subtract(15, 'days');
  }),

  endAtWithCache: Ember.computed('endAt', function() {
    return moment(this.get('endAt')).add(15, 'days');
  }),

  serieHeight: 75,
  seriePadding: 10,
  seriesLength: Ember.computed.alias('trackables.length'),

  seriesWidth: Ember.computed('SVGWidth', function() {
    return this.get('SVGWidth') * 3;
  }),

  totalSeriesHeight: Ember.computed('seriesLength', 'serieHeight', 'seriePadding', function() {
    return this.get('seriesLength') * this.get('serieHeight') + this.get('seriesLength') * this.get('seriePadding');
  }),

  timelineHeight: 25,
  timelineLength: Ember.computed.alias('timeline.length'),

  timeline: Ember.computed('startAtWithCache', 'endAtWithCache', function() {
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
      return this.get('totalSeriesHeight') + this.get('timelineHeight');
    } else {
      return this.get('timelineHeight');
    }
  }),

  SVGWidth: Ember.computed(function() {
    return this.$().width();
  }),

  onDidInsertElement: Ember.on('didInsertElement', function() {
    Ember.run.scheduleOnce('afterRender', this, () => {
      this.fetchDataChart().then( () => {
        this.set('chartLoaded', true);
      });
    });
  }),

  fetchDataChart() {
    var startAt = this.get('startAtWithCache').format("YYYY-MM-DD");
    var endAt = this.get('endAtWithCache').format("YYYY-MM-DD");

    return this.get('store').queryRecord('chart', { id: 'health', start_at: startAt, end_at: endAt }).then( chart => {
      this.set('checkins', chart.get('checkins').sortBy('date:asc') );
      this.set('trackables', chart.get('trackables').sortBy('type'));
    });
  },

  onDragged(){
    this.fetchDataChart();
  },

  onDragging(direction){
    var nextStartAt, nextEndAt;

    if(Ember.isEqual('right', direction)) {
      nextStartAt = moment(this.get('startAt')).subtract(1, 'days');
      nextEndAt = moment(this.get('endAt')).subtract(1, 'days');

      if( nextStartAt > moment().subtract(90, 'days') ) {
        this.set('startAt',  nextStartAt);
        this.set('endAt',  nextEndAt);
      }

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
      this.set('xPosition', xPosition)
      this.set('openInfoWindow', true)
    },

    closeInfoWindow(date, xPosition) {
      this.set('xPosition', null)
      this.set('openInfoWindow', false)
    }

  }


});
