class FiguresController < ApplicationController
  def create
    map = Map.find(params[:map_id])
    if figure = map.figures.create(params[:figure])
      render :json => { :id => figure.id }, :status => :created
    else
      head :error
    end
  end

  def update
    figure = Figure.find(params[:id], :conditions => { :map_id => params[:map_id] })
    head(figure.update_attributes(params[:figure]) ? :no_content : :error)
  end

  def destroy
    figure = Figure.find(params[:id], :conditions => { :map_id => params[:map_id] })
    head(figure.destroy ? :no_content : :error)
  end
end
