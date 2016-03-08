require 'rails_helper'

RSpec.describe Api::V1::CheckinsController do
  let!(:user) { create(:user) }
  let(:date) { '2016-01-06' }

  before { sign_in user }

  describe 'index' do
    context 'when checkin exists for the requested date' do
      before { create(:checkin, date: Date.parse(date), user_id: user.id) }
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

  describe 'create' do
    it 'returns new checkin' do
      post :create, checkin: { date: date }
      returned_checkin = response_body[:checkin]
      expect(Date.parse(returned_checkin[:date])).to eq Date.parse(date)
    end
  end

  describe 'update' do
    let(:checkin) { create(:checkin, user_id: user.id, date: Date.today) }
    context 'permitted attributes' do
      let(:attributes) { { id: checkin.id, checkin: { note: 'Blah' } } }
      it 'returns updated checkin' do
        put :update, attributes
        returned_checkin = response_body[:checkin]
        expect(returned_checkin[:id]).to eq checkin.id.to_s
        expect(returned_checkin[:note]).to eq attributes[:checkin][:note]
      end
    end
    context 'non-permitted attributes' do
      let(:attributes) { { id: checkin.id, checkin: { date: Date.yesterday } } }
      it 'returns checkin with no changes' do
        put :update, attributes
        returned_checkin = response_body[:checkin]
        expect(returned_checkin[:id]).to eq checkin.id.to_s
        expect(returned_checkin[:date]).not_to eq attributes[:checkin][:date]
      end
    end
    context "when same treatment's doses exist in user's previous checkins" do
      let!(:treatment) { create(:treatment) }
      let!(:checkin1) { create(:checkin, user_id: user.id, date: Date.yesterday) }
      let!(:checkin1_treatment) { create(:checkin_treatment, checkin: checkin1, treatment_id: treatment.id, value: '20 mg') }
      let!(:checkin2) { create(:checkin, user_id: user.id, date: Date.today - 2.days) }
      let!(:checkin2_treatment) { create(:checkin_treatment, checkin: checkin2, treatment_id: treatment.id) }
      let(:attributes) { { id: checkin.id, checkin: { treatments_attributes: [{ treatment_id: treatment.id }] } } }
      it 'auto-sets the most recently used dose on added treatments' do
        put :update, attributes
        returned_treatments = response_body[:checkin][:treatments]
        expect(returned_treatments).to be_a Array
        returned_treatment = returned_treatments[0]
        expect(returned_treatment[:treatment_id]).to eq treatment.id
        expect(returned_treatment[:value]).to eq checkin1_treatment.value
      end
    end
  end

end
