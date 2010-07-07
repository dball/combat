class ImagesController < ApplicationController
  def show
    @image = Image.find(params[:id], :conditions => { :map_id => params[:map_id] })
  end

  def new
    @image = map.images.build
  end

  def create
    image = map.images.build(:blob => request.raw_post)
    geo = Paperclip::Geometry.from_file(image.image.to_file)
    image.attributes=({ :image_width => geo.width, :image_height => geo.height })
    image.image_content_type = request.content_type
    if image.save
      render :json => image.to_json(:methods => [:url, :aspect_ratio]), :status => :created
    else
      head :error
    end
  end

  def update
    head(image.update_attributes(params[:image]) ? :no_content : :error)
  end

  def destroy
    head(image.destroy ? :no_content : :error)
  end

  private

  def image
    @image ||= Image.find(params[:id], :conditions => { :map_id => params[:map_id] })
  end
   
  def map
    Map.find(params[:map_id])
  end
end
