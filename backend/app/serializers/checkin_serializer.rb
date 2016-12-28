class CheckinSerializer < ApplicationSerializer
  attributes :id, :date, :note, :tag_ids, :food_ids, :postal_code

  has_many :conditions, embed: :objects, serializer: CheckinConditionSerializer
  has_many :symptoms, embed: :objects, serializer: CheckinSymptomSerializer
  has_many :treatments, embed: :objects, serializer: CheckinTreatmentSerializer

  has_one :weather, include: true
end
