class ImagesController < ApplicationController
  def show
    @image = Image.find(params[:id], :conditions => { :map_id => params[:map_id] })
  end

  def new
    @image = map.images.build
  end

  def create
    image = map.images.build(:blob => request.raw_post)
    image.image_content_type = request.content_type
    if image.save
      render :json => { :id => image.id }, :status => :created
    else
      head :error
    end
  end

  private
   
  def map
    Map.find(params[:map_id])
  end
end
