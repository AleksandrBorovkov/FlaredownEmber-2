class Search::Dose < Search

  validates :query, presence: true

  validate :query_must_include_treatment_id
  def query_must_include_treatment_id
    if query[:treatment_id].nil?
      errors.add(:query, "must include treatment_id")
    end
  end


  protected

  def find_by_query
    q = name.present? ? treatments.where(value: /#{name}/i) : treatments
    q = q.order_by('checkin.date' => 'desc').distinct(:value)
    q.slice(0..10).map { |value| ::Dose.new(name: value) }
  end


  private

  def treatments
    Checkin::Treatment.where(
      :value.ne => nil, is_taken: true, treatment_id: treatment_id
    )
  end

  def treatment_id
    query[:treatment_id].to_i
  end

  def name
    query[:name]
  end

end
