class MapsController < ApplicationController
  def show
    @map = Map.find(params[:id])
    @json = @map.to_json(:include => { :figures => { :include => :character }, :walls => { :include => :vertices } })
  end

  def latest
    redirect_to map_path(Map.last || Map.create)
  end
end
