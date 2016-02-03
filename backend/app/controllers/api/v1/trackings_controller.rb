class Api::V1::TrackingsController < Api::BaseController
  load_and_authorize_resource except: :create

  def index
    render json: @trackings.active_at(at)
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
    @tracking.update_attributes!(end_at: Date.today)
    head :no_content
  end

  private

  def at
    DateTime.parse(params.require(:at))
  end

  def create_params
    params.require(:tracking).permit(:trackable_id, :trackable_type)
  end

end
