class Map < ActiveRecord::Base
  has_many :viewports, :dependent => :destroy
  has_many :figures, :dependent => :destroy, :inverse_of => :map
  has_many :walls, :dependent => :destroy
  has_many :images, :dependent => :destroy

  validates_presence_of :name

  before_validation do |map|
    logger.debug("Checking map name: #{map.name}")
    unless map.name.present?
      map.name = "Map #{new_record? ? (Map.count + 1) : id}"
    end
  end

  def points
    [figures, walls, images].map {|c| c.map {|o| o.points }.flatten }.flatten
  end
end
