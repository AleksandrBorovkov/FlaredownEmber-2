class Api::V1::InvitationsController < ApplicationController

  def show
    render json: Invitation.find(params[:id])
  end

  def update
    invitation = Invitation.find(params[:id])
    invitation.accept!(
      params.require(:invitation).permit(:first_name, :last_name, :password, :password_confirmation)
    )
    render json: invitation
  end
end
