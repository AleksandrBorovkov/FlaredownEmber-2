class Api::V1::TrackingsController < ApplicationController
  load_and_authorize_resource except: :create

  def index
    render json: @trackings.by_trackable_type(trackable_type).active_at(at)
  end

  def show
    render json: @tracking
  end

  def create
    tracking = Tracking.new(create_params.merge(start_at: Date.today, user: current_user))
    authorize! :create, tracking
    tracking.save!
    render json: tracking
  end

  def destroy
    TrackingDestroyer.new(current_user, @tracking, Date.today).destroy
    head :no_content
  end

  private

  def at
    DateTime.parse(params.require(:at))
  end

  def trackable_type
    params.require(:trackable_type)
  end

  def create_params
    params.require(:tracking).permit(:trackable_id, :trackable_type, :color_id)
  end
end
