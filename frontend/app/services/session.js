import Ember from 'ember';
import SessionService from 'ember-simple-auth/services/session';

export default SessionService.extend({
  dataStore: Ember.inject.service('store'),

  userId: Ember.computed.alias('session.authenticated.user_id'),
  email: Ember.computed.alias('session.authenticated.email'),
  token: Ember.computed.alias('session.authenticated.token'),

  notificationChannel: Ember.computed.alias('extraSession.notificationChannel'),

  discourseUrl: Ember.computed.alias('extraSession.discourseUrl'),
  discourseEnabled: Ember.computed.alias('extraSession.discourseEnabled'),

  setCurrentUser: Ember.on('init', Ember.observer('isAuthenticated', function() {
    var userId = this.get('userId');
    if (Ember.isPresent(userId)) {
      this.set('currentUser', this.get('dataStore').find('user', userId));
    } else {
      this.set('currentUser', null);
    }
  })),

  setExtraSession: Ember.on('init', Ember.observer('currentUser', function() {
    this.set('extraSession', this.get('dataStore').find('session', 1));
  })),

  isUserengageSet: false,
  userengage: Ember.inject.service(),
  setupUserengage: Ember.on('init', Ember.observer('currentUser', function() {
    let currentUser = this.get('currentUser');
    if (Ember.isPresent(currentUser)) {
      currentUser.then( user => {
        user.get('profile').then( profile => {
          this.get('userengage').initialize({
            state: 'simple',
            email: user.get('email'),
            sex: profile.get('sex.id'),
            country_code: profile.get('country.id'),
            birth_date: profile.get('birthDate'),
            education_level: profile.get('educationLevel.id'),
            onboarded: profile.get('isOnboarded')
          });
          this.set('isUserengageSet', true);
        });
      });
    } else {
      if (this.get('isUserengageSet')) {
        this.get('userengage').destroy();
      }
    }
  })),

  setFullStoryUser: Ember.on('init', Ember.observer('currentUser', function() {
    let currentUser = this.get('currentUser');
    if (Ember.isPresent(currentUser)) {
      currentUser.then( user => {
        window.FS.identify(user.get('id'));
      });
    }
  })),

  setDeviceType: Ember.on('init', function() {
    this.set('isMobileDevice', /iPad|iPhone|iPod|Android/.test(navigator.userAgent));
  })

});
