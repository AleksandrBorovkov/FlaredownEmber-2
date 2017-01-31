import Ember from 'ember';
import Graphable from 'flaredown/components/chart/graphable';

const { Component, computed, get } = Ember;

export default Component.extend(Graphable, {
  halfHeight: computed('height', function() {
    return get(this, 'yScale')(0);
  }),

  yScale: computed('data', function() {
    return d3.scale.linear().range([get(this, 'height') , 0]).domain([-1, 1]);
  }),

  data: computed('timeline', function() {
    return (this.get('timeline') || []).map(day => ({ x: day, y: null })).sortBy('x');
  }),
});
