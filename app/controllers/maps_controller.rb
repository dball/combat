class MapsController < ApplicationController
  def show
    @map = Map.find(params[:id])
  end

  def latest
    redirect_to map_path(Map.last || Map.create)
  end
end
