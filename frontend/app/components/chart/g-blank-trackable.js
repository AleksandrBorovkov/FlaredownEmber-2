import Ember from 'ember';
import Graphable from 'flaredown/components/chart/graphable';

const {
  computed,
  Component,
} = Ember;

export default Component.extend(Graphable, {
  dataYValues: [0, 1, 2, 3, 4],

  yScale: computed('data', function() {
    return d3.scale.linear().range([this.get('height') , 0]).domain([-1, 5]);
  }),

  data: computed('timeline', function() {
    return (this.get('timeline') || []).map(day => ({ x: day, y: null })).sortBy('x');
  }),
});
