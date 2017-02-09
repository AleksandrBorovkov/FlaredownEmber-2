import Ember from 'ember';

const {
  get,
  set,
  computed,
  Component,
  isPresent,
  getProperties,
  setProperties,
  run: {
    scheduleOnce,
  },
} = Ember;

export default Component.extend({
  checkins: [],
  loadingCheckins: true,

  endAt: computed('checkins.lastObject.date', function() {
    return moment(get(this, 'checkins.lastObject.date'));
  }),

  didInsertElement() {
    this._super(...arguments);

    scheduleOnce('afterRender', this, () => {
      if (get(this, 'store').peekAll('checkin').toArray().length) {
        this.loadCheckins();
      } else {
        this.fetchMore().then(() => this.loadCheckins());
      }
    });
  },

  fetchMore() {
    const format = "YYYY-MM-DD";
    let { endAt, startAt } = getProperties(this, 'endAt', 'startAt');

    startAt = moment(startAt || endAt).subtract(10, 'days');

    set(this, 'startAt', startAt);

    return this
      .store
      .queryRecord('chart', {
        id: 'health',
        end_at: endAt.format(format),
        start_at: startAt.format(format),
      });
  },

  loadCheckins() {
    const checkins = this.peekReverseSortedCheckins();

    if (isPresent(checkins)) {
      setProperties(this, {
        checkins: this.peekReverseSortedCheckins(),
        loadingCheckins: false,
      });
    } else {
      setProperties(this, {
        loadingCheckins: false,
        noCheckinsPresent: true,
      });
    }
  },

  peekReverseSortedCheckins() {
    return this
      .store
      .peekAll('checkin')
      .toArray()
      .filter(
        c => isPresent(get(c, 'note'))
      )
      .sort(
        (b, a) => moment(get(a, 'date')).diff(get(b, 'date'), 'days')
      );
  },

  actions: {
    crossedTheLine() {
      set(this, 'loadingCheckins', true);

      this.fetchMore().then(() => this.loadCheckins());
    },
  },
});
