class Ability
  include CanCan::Ability

  # rubocop:disable Metrics/AbcSize
  def initialize(user)
    user ||= User.new # guest user (not logged in)

    can :manage, User, id: user.id
    can :manage, Profile, user_id: user.id

    can :read, Condition, global: true
    can :read, Condition, id: popular_trackable_ids('Condition')
    can :create, Condition, global: false
    can :manage, Condition, id: user.condition_ids

    can :read, Food
    can :create, Food

    can [:read, :create], HarveyBradshawIndex do |hbi|
      hbi.checkin.encrypted_user_id == SymmetricEncryption.encrypt(user.id)
    end

    can :read, Symptom, global: true
    can :read, Symptom, id: popular_trackable_ids('Symptom')
    can :create, Symptom, global: false
    can :manage, Symptom, id: user.symptom_ids

    can :read, Treatment, global: true
    can :read, Treatment, id: popular_trackable_ids('Treatment')
    can :create, Treatment, global: false
    can :manage, Treatment, id: user.treatment_ids

    can :manage, Tracking, user_id: user.id

    can :manage, Tag

    can :read, Weather if user.persisted?
  end
  # rubocop:enable Metrics/AbcSize

  private

  def popular_trackable_ids(trackable_class_name)
    user_trackable_class = "User#{trackable_class_name}".constantize
    trackable_id_attr = "#{trackable_class_name.underscore}_id".to_sym
    counts = user_trackable_class.group(trackable_id_attr).count
    min_popularity = Flaredown.config.trackables_min_popularity
    counts.select { |_id, count| count >= min_popularity }.keys
  end
end
