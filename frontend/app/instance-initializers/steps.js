export default {
  name: 'steps',

  initialize(application) {
    application.inject('route:index', 'stepsService', 'service:steps');
    application.inject('route:checkin', 'stepsService', 'service:steps');
    application.inject('route:onboarding', 'stepsService', 'service:steps');

    application.inject('component:checkin-dialog', 'stepsService', 'service:steps');
    application.inject('component:checkin-navigation', 'stepsService', 'service:steps');
    application.inject('component:checkin/start-step', 'stepsService', 'service:steps');
    application.inject('component:checkin/trackables-step', 'stepsService', 'service:steps');
    application.inject('component:checkin/health-factors-step', 'stepsService', 'service:steps');

    application.inject('component:onboarding-dialog', 'stepsService', 'service:steps');

    application.inject('model:profile', 'stepsService', 'service:steps');
  },
};
