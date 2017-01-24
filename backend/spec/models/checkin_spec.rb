require 'rails_helper'

RSpec.describe Checkin, type: :model do
  include Mongoid::Matchers

  describe 'Relations' do
    it { is_expected.to have_many(:conditions) }
    it { is_expected.to have_many(:symptoms) }
    it { is_expected.to have_many(:treatments) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:date) }
    it { is_expected.to validate_presence_of(:encrypted_user_id) }
    it { is_expected.to validate_uniqueness_of(:date).scoped_to(:encrypted_user_id) }
  end
end
