class Api::V1::CheckinsController < Api::BaseController

  def index
    date = Date.parse(params.require(:date))
    render json: current_user.checkins.where(date: date)
  end

  def show
    render json: Checkin.find(id)
  end

  def create
    date = params.require(:checkin).require(:date)
    checkin = CheckinCreator.new(current_user.id, Date.parse(date)).create!
    render json: checkin
  end

  def update
    checkin = Checkin.find(id)
    checkin.update_attributes!(update_params)
    render json: checkin
  end

  private

  def update_params
    params.require(:checkin).permit(:note,
      conditions_attributes: [:id, :value, :condition_id, :color_id, :_destroy],
      symptoms_attributes: [:id, :value, :symptom_id],
      treatments_attributes: [:id, :value, :treatment_id])
  end

  def id
    params.require(:id)
  end

end
