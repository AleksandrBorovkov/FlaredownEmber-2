import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';

const {
  get,
  set,
  computed,
  Component,
  getProperties,
  inject: {
    service,
  },
} = Ember;

export default Component.extend(InViewportMixin, {
  classNames: ['flaredown-white-box'],

  ajax: service(),
  notifications: service(),
  elipsis: 175,

  didEnterViewport() {
    const { ajax, post } = getProperties(this, 'ajax', 'post');

    if (get(post, 'notifications.reaction')) {
      const id = get(post, 'id');

      ajax
        .del(`notifications/post/${id}`)
        .then(() => set(post, 'notifications', {}))
        .then(() => get(this, 'notifications').unloadNotification({ notificateableId: id }));
    }
  },
});
