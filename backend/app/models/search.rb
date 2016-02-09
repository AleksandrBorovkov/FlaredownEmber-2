class Search
  include ActiveModel::Model, ActiveModel::Serialization

  attr_accessor :resource, :user, :query

  #
  # Validations
  #
  validates :resource, presence: true

  validates_inclusion_of :resource, in: %w(treatment symptom condition)

  def id
    Digest::SHA256.base64digest(resource)
  end

  def searchables
    @searchables ||= find_by_query
  end

  private

  def find_by_query
    if query_hash.present?
      resources.where(*where_conditions).limit(10)
    else
      resources.limit(10)
    end
  end

  def where_conditions
    @where_conditions ||= Array.new.tap do |conditions|
      query_hash.each do |key,value|
        conditions << [':key ILIKE :value', { key: key, value: value }]
      end
      conditions
    end
  end

  def resources
    resource.classify.constantize
  end

  def query_hash
    @query_hash ||= Hash(query)
  end
end
