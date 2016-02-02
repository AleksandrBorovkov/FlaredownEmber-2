require 'rails_helper'

RSpec.describe Api::V1::CheckinsController do

  let!(:user) { create(:user) }

  before { sign_in user }

  describe 'index' do
    let(:date) { '2016-01-06' }
    context 'when checkin exists for the passed date' do
      before { create(:checkin, date: Date.parse(date)) }
      it 'returns correct checkin' do
        get :index, date: date
        expect(response_body[:checkins].count).to eq 1
        returned_checkin = response_body[:checkins][0]
        expect(Date.parse(returned_checkin[:date])).to eq Date.parse(date)
      end
    end
    context "when checkin doesn't exist for the passed date" do
      it 'returns no results' do
        get :index, date: date
        expect(response_body[:checkins].count).to eq 0
      end
    end
  end

end
