class ViewportsController < ApplicationController
  def show
    @json = viewport.to_json(:include => { :map => { :include => { :figures => { :include => :character }, :walls => { :include => :vertices } } } })
  end

  def update
    if viewport.update_attributes(params[:viewport])
      render :json => viewport.to_json
    else
      head :error
    end
  end

  def zoom
    if viewport.zoom(params[:direction]) && viewport.save
      render :json => viewport.to_json
    else
      head :error
    end
  end

  def pan
    if viewport.pan(params[:direction], params[:axis]) && viewport.save
      render :json => viewport.to_json
    else
      head :error
    end
  end

  private

  def viewport
    @viewport ||= Viewport.find(params[:id], :conditions => { :map_id => params[:map_id] })
  end
end
