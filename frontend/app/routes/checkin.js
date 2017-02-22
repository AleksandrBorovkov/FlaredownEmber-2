import Ember from 'ember';
import AuthenticatedRouteMixin from 'flaredown/mixins/authenticated-route-mixin';

const {
  get,
  set,
  RSVP,
  Route,
} = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  model(params) {
    var checkinId = params.checkin_id;
    var stepId = `${this.routeName}-${params.step_key}`;

    return RSVP.hash({
      stepId,
      checkin: this.store.find('checkin', checkinId),
    });
  },

  afterModel(model) {
    set(this, 'stepsService.checkin', model.checkin);
  },
});
