class Api::V1::ProfilesController < Api::BaseController
  load_and_authorize_resource

  def show
    render json: @profile
  end

  def update
    @profile.update_attributes!(update_params)
    render json: @profile
  end

  private

  def update_params
    params.require(:profile).permit(:country_id, :birth_date, :sex_id)
  end

end
