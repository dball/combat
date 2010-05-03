class ImagesController < ApplicationController
  def show
    @image = Image.find(params[:id], :conditions => { :map_id => params[:map_id] })
  end

  def new
    @image = map.images.build
  end

  def create
    if image = map.images.create(:blob => request.raw_post)
      redirect_to map_image_path(map, image)
    end
  end

  private
   
  def map
    Map.find(params[:map_id])
  end
end
