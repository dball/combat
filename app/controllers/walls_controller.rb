class WallsController < ApplicationController
  def create
    map = Map.find(params[:map_id])
    if wall = map.walls.create(params[:wall])
      render :json => { :id => wall.id }, :status => :created
    else
      head :error
    end
  end

  def update
    head(wall.update_attributes(params[:wall]) ? :no_content : :error)
  end

  private

  def wall
    @wall ||= Wall.find(params[:id], :conditions => { :map_id => params[:map_id] })
  end
end
