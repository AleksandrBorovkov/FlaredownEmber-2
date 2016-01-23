import Ember from 'ember';

export default Ember.Component.extend({
  classNames: 'navigation-bar',

  actions: {
    invalidateSession() {
      this.get('session').invalidate();
    },

    openEditProfileModal() {
      Ember.getOwner(this).lookup('route:application').send('openModal', 'profile', null, 'application');
    },

  }

});
