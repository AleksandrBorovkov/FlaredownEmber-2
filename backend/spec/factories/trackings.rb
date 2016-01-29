# == Schema Information
#
# Table name: trackings
#
#  id             :integer          not null, primary key
#  user_id        :integer
#  trackable_id   :integer
#  trackable_type :string
#  start_at       :datetime
#  end_at         :datetime
#

FactoryGirl.define do
  factory :tracking do
    user
    start_at Time.now

    trait :for_condition do
      association :trackable, factory: :condition
    end

    trait :for_symptom do
      association :trackable, factory: :symptom
    end
  end
end
