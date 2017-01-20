import Ember from 'ember';

export default Ember.Mixin.create({
  tagName: 'g',
  classNames: 'chart',
  attributeBindings: ['transform'],

  transform: Ember.computed('height', 'padding', 'chartOffset', function() {
    return `translate(0,${this.get('chartOffset')})`;
  }),

  nestedTransform: Ember.computed('height', 'startAt', 'data', function() {
    return `translate(${ - this.get('xScale')( this.get('startAt') )}, 5)`;
  }),

  xDomain: Ember.computed('data', function() {
    return d3.extent(this.get('data'), d => d.x);
  }),

  xScale: Ember.computed('data', function() {
    return(
      d3
        .time
        .scale()
        .range([0, this.get('width')])
        .domain(this.get('xDomain'))
    );
  }),

  lineData: Ember.computed('data', function() {
    return this.get('data').reject(item => Ember.isEmpty(item.y));
  }),

  lineFunction: Ember.computed('lineData', function() {
    return(
      d3
        .svg
        .line()
        .x(this.getX.bind(this))
        .y(this.getY.bind(this))
        .interpolate('linear')
        (this.get('lineData'))
    );
  }),

  getX(d) {
    return this.get('xScale')(d.x);
  },

  getY(d) {
    return this.get('yScale')(d.y) - 4; // minus radius
  },

  actions: {
    openPointTooltip(point) {
      this.set('openPointTooltip', true);
      this.set('currentPoint', point);
    },

    closePointTooltip() {
      this.set('openPointTooltip', false);
      this.set('currentPoint', null);
    },
  }
});