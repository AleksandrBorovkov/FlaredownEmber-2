class Api::V1::UnsubscribesController < ApplicationController
  skip_before_action :authenticate_user!

  def update
    profile = Profile.find_by(notify_token: activation_params[:notify_token])
    attribute = activation_params[:notify_top_posts] ? "notify_top_posts" : "notify"
    profile&.update_attributes(attribute.to_sym => false)

    head :ok
  end

  private

  def activation_params
    params.permit(:notify_token, :notify_top_posts)
  end
end
