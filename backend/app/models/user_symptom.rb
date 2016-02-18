# == Schema Information
#
# Table name: user_symptoms
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  symptom_id :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class UserSymptom < ActiveRecord::Base
  #
  # Associations
  #
  belongs_to :user
  belongs_to :symptom

  #
  # Validations
  #
  validates :user, :symptom, presence: true
end
