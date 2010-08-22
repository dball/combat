class MapsController < ApplicationController
  def show
    @json = map.to_json(:include => {
      :figures => { :include => :character, :methods => :subscript },
      :walls => { :include => :vertices },
      :images => { :methods => :url },
      :effects => {}
    })
  end

  def create
    redirect_to map_path(Map.create)
  end

  def update
    if map.update_attributes(params[:map])
      render :json => map.to_json
    else
      head :error
    end
  end

  def latest
    redirect_to map_path(Map.last || Map.create)
  end

  def reset
    viewport.attributes = { :aspect => params[:aspect] }
    viewport.reset(map)
    render_viewport
  end

  def pan
    viewport.pan(params[:direction], params[:axis])
    render_viewport
  end

  def zoom
    viewport.zoom(params[:direction])
    render_viewport
  end

  private

  def render_viewport
    render :json => viewport.to_json(:except => :map_id)
  end

  def map
    @map ||= Map.find(params[:id], :include => [:figures, :images, { :walls => :vertices }])
  end
  
  def viewport
    @viewport ||= begin
      viewport = session[:viewport]
      if viewport.nil? || viewport.id != map.id
        viewport = session[:viewport] = Viewport.new(map)
      end
      viewport
    end
  end
end
