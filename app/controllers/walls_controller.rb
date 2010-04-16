class WallsController < ApplicationController
  def create
    map = Map.find(params[:map_id])
    if wall = map.walls.create(:vertex_values => params[:xy])
      render :json => { :id => wall.id }, :status => :created
    else
      head :error
    end
  end
end
