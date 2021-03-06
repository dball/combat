class FiguresController < ApplicationController
  def create
    map = Map.find(params[:map_id])
    if figure = map.figures.create(params[:figure])
      render :json => { :id => figure.id, :subscript => figure.subscript, :color_json => figure.color_json, :bgcolor_json => figure.bgcolor_json }
    else
      head :error
    end
  end

  def update
    head(figure.update_attributes(params[:figure]) ? :no_content : :error)
  end

  def destroy
    head(figure.destroy ? :no_content : :error)
  end

  def enlarge
    figure.enlarge && figure.save
    render :json => { :size => figure.size }
  end

  def reduce
    figure.reduce && figure.save
    render :json => { :size => figure.size }
  end

  private

  def figure
    @figure ||= Figure.find(params[:id], :conditions => { :map_id => params[:map_id] })
  end
end
