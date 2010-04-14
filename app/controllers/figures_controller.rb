class FiguresController < ApplicationController
  def update
    figure = Figure.find(params[:id], :conditions => { :map_id => params[:map_id] })
    head(figure.update_attributes(params[:figure]) ? :no_content : :error)
  end
end
