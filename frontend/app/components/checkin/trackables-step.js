/* global moment */
import Ember from 'ember';
import TrackablesFromType from 'flaredown/mixins/trackables-from-type';
import RunEvery from 'flaredown/mixins/run-every';

export default Ember.Component.extend(TrackablesFromType, RunEvery, {

  model: Ember.computed.alias('parentView.model'),

  stepControls: true,

  tracking: Ember.inject.service(),
  setupTracking: Ember.on('init', function() {
    this.get('tracking').setup({
      at: new Date(),
      trackableType: this.get('trackableType').capitalize()
    });
  }),

  autosaveCheckin: Ember.on('init', function() {
    this.runEvery(2, () => {
      this.saveCheckin();
    });
  }),

  checkin: Ember.computed.alias('model.checkin'),
  isTodaysCheckin: Ember.computed('checkin', function() {
    return moment(this.get('checkin.date')).isSame(new Date(), 'day');
  }),


  removedTrackeds: Ember.A([]),
  addedTrackeds: Ember.A([]),

  actions: {
    remove(tracked) {
      tracked.prepareForDestroy();
      this.get('removedTrackeds').pushObject(tracked);
    },
    add() {
      var selectedTrackable = this.get('selectedTrackable');
      if (Ember.isPresent(selectedTrackable.get('id'))) {
        this.addTrackable(selectedTrackable);
      } else {
        selectedTrackable.save().then( savedTrackable => {
          this.addTrackable(savedTrackable);
        });
      }
    },

    completeStep() {
      this.saveCheckin();
      this.get('onStepCompleted')();
    },
    goBack() {
      this.saveCheckin();
      this.get('onGoBack')();
    }
  },

  addTrackable: function(trackable) {
    var trackableType = this.get('trackableType');
    // check if trackable is already present in this checkin
    Ember.RSVP.resolve(this.get('trackeds')).then(trackeds => {
      var foundTrackable = trackeds.findBy(`${trackableType}.id`, trackable.get('id'));
      if (Ember.isNone(foundTrackable)) {
        var randomColor = Math.floor(Math.random()*32)+'';
        var recordAttrs = {colorId: randomColor};
        recordAttrs[trackableType] = trackable;
        var recordType = `checkin_${trackableType}`.camelize();
        var tracked = this.store.createRecord(recordType, recordAttrs);
        this.get('trackeds').pushObject(tracked);
        this.get('addedTrackeds').pushObject(tracked);
      }
      this.set('selectedTrackable', null);
    });
  },

  isSaving: false,
  othersAreSaving: false,
  saveCheckin: function() {
    this.checkinSavePromise().then(() => {
      this.onCheckinSaved();
    });
  },
  checkinSavePromise: function() {
    return new Ember.RSVP.Promise(resolve => {
      var checkin = this.get('checkin');
      if (!(this.get('isSaving') || this.get('othersAreSaving')) &&
          Ember.isPresent(checkin) &&
          checkin.trackablesChanged(this.get('trackableType'))) {
        this.set('isSaving', true);
        this.untrackRemovedTrackeds();
        this.trackAddedTrackeds();
        this.cleanUntakenTreatments();
        checkin.save().then(() => {
          resolve();
        });
      } else {
        // Ember.Logger.debug("No need to save checkin");
      }
    });
  },
  onCheckinSaved: function() {
    Ember.Logger.debug('Checkin successfully saved');
    if (this.get('isDestroyed') || this.get('isDestroying')) {
      return;
    } else {
      this.deleteAddedTrackeds();
      this.get('checkin').set('tagsChanged', false);
      this.set('isSaving', false);
      this.set('addedTrackeds', Ember.A([]));
      this.set('removedTrackeds', Ember.A([]));
    }
  },

  untrackRemovedTrackeds: function() {
    // untrack() all removedTrackeds if isTodaysCheckin
    if (this.get('isTodaysCheckin')) {
      var removedTrackeds = this.get('removedTrackeds');
      while (!Ember.isEmpty(removedTrackeds)) {
        var record = removedTrackeds.popObject();
        this.get('tracking').untrack({
          trackable: record.get(this.get('trackableType'))
        });
      }
    }
  },

  trackAddedTrackeds: function() {
    // track() all addedTrackeds if isTodaysCheckin
    if (this.get('isTodaysCheckin')) {
      this.get('addedTrackeds').forEach(record => {
        var trackable = record.get(this.get('trackableType'));
        this.get('tracking').track(
          trackable, trackable.get('colorId')
        );
      });
    }
  },

  deleteAddedTrackeds: function() {
    // remove the added ones to avoid 'ghost' records
    var addedTrackeds = this.get('addedTrackeds');
    while (!Ember.isEmpty(addedTrackeds)) {
      var record = addedTrackeds.popObject();
      record.deleteRecord();
    }
  },

  cleanUntakenTreatments: function() {
    // we need to delete value on treatments not taken
    if (this.get('trackableTypeIsTreatment')) {
      this.get('trackeds').forEach(record => {
        record.cleanIfUntaken();
      });
    }
  }

});
