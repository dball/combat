class Image < ActiveRecord::Base
  belongs_to :map

  has_attached_file :image, :storage => :s3,
    :s3_credentials => {
      :access_key_id => ENV['S3_KEY'],
      :secret_access_key => ENV['S3_SECRET']
    },
    :bucket => "combat-#{Rails.env.to_s}",
    :path => '/images/:id'

  def url
    image.url
  end

  def url=(url)
  end

  def aspect_ratio
    image_width.to_f / image_height
  end

  def points
    x && y && width && height ? [{ :x => x, :y => y }, { :x => x + width, :y => y + height }] : []
  end

  def blob=(blob)
    StringIO.open(blob) {|io| self.image = io }
  end
end
