import Ember from 'ember';
import CheckinByDate from 'flaredown/mixins/checkin-by-date';

const {
  set,
  Component,
  inject: { service },
  computed: { alias },
} = Ember;

export default Component.extend(CheckinByDate, {
  journalIsVisible: alias('chartJournalSwitcher.journalIsVisible'),
  chartJournalSwitcher: service(),

  actions: {
    routeToCheckin(date) {
      this.routeToCheckin(date);
    },

    showJournal() {
      set(this, 'journalIsVisible', true);
    },

    showChart() {
      set(this, 'journalIsVisible', false);
    },
  },
});
