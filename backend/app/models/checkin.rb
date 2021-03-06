class Checkin
  include Mongoid::Document

  HBI_PERIODICITY = 7

  attr_accessor :includes

  #
  # Fields
  #
  field :date,        type: Date
  field :food_ids,    type: Array, default: []
  field :note,        type: String
  field :postal_code, type: String
  field :tag_ids,     type: Array
  field :weather_id,  type: Integer
  field :encrypted_user_id, type: String, encrypted: { type: :integer }

  #
  # Relations
  #
  has_one :harvey_bradshaw_index
  has_many :treatments, class_name: 'Checkin::Treatment'
  has_many :conditions, class_name: 'Checkin::Condition'
  has_many :symptoms, class_name: 'Checkin::Symptom'
  accepts_nested_attributes_for :conditions, :symptoms, :treatments, allow_destroy: true

  #
  # Indexes
  #
  index(encrypted_user_id: 1)
  index(date: 1, encrypted_user_id: 1)

  #
  # Validations
  #
  validates :encrypted_user_id, presence: true
  validates :date, presence: true, uniqueness: { scope: :encrypted_user_id }

  #
  # Scopes
  #
  scope :by_date, ->(startkey, endkey) { where(:date.gte => startkey, :date.lte => endkey) }

  def user
    @user ||= User.find(user_id)
  end

  def weather
    @weather ||= Weather.find_by(id: weather_id)
  end

  def tags
    if includes
      @_tags_included ||= Tag.where(id: tag_ids - (includes[:tags] || []))
    else
      @_tags ||= Tag.where(id: tag_ids)
    end
  end

  def foods
    if includes
      @_foods_included ||= Food.where(id: food_ids - (includes[:foods] || []))
    else
      @_foods ||= Food.where(id: food_ids)
    end
  end

  def available_for_hbi?
    return true if harvey_bradshaw_index
    return false unless date.today?
    return true unless latest_hbi

    HBI_PERIODICITY - ((latest_hbi.date)...date).count < 1
  end

  class Condition
    include Mongoid::Document
    include Checkin::Trackable
    include Checkin::Fiveable

    field :condition_id, type: Integer

    validates :condition_id, uniqueness: { scope: :checkin_id }
  end

  class Symptom
    include Mongoid::Document
    include Checkin::Trackable
    include Checkin::Fiveable

    field :symptom_id, type: Integer

    validates :symptom_id, uniqueness: { scope: :checkin_id }
  end

  class Treatment
    include Mongoid::Document
    include Checkin::Trackable

    #
    # Fields
    #
    field :treatment_id, type: Integer
    field :value, type: String
    field :is_taken, type: Boolean

    #
    # Indexes
    #
    index(treatment_id: 1)
    index(treatment_id: 1, is_taken: 1, value: 1)

    #
    # Validations
    #
    validates :treatment_id, uniqueness: { scope: :checkin_id }
  end

  private

  def latest_hbi
    @_latest_hbi ||= HarveyBradshawIndex.where(encrypted_user_id: encrypted_user_id).order(date: :desc).first
  end
end
