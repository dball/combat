class MapsController < ApplicationController
  def show
    map = Map.find(params[:id])
    redirect_to map_viewport_path(map, map.viewports.create)
  end

  def latest
    redirect_to map_path(Map.last || Map.create)
  end
end
