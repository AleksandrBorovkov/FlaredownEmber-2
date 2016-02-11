# == Schema Information
#
# Table name: symptoms
#
#  id         :integer          not null, primary key
#  global     :boolean          default(TRUE)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class SymptomSerializer < ApplicationSerializer
  include SearchableSerializer
  include TrackableSerializer

  attributes :id, :name
end
