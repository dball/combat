class Map < ActiveRecord::Base
  has_many :viewports, :dependent => :destroy
  has_many :figures, :dependent => :destroy, :inverse_of => :map
  has_many :walls, :dependent => :destroy
  has_many :images, :dependent => :destroy
  has_many :effects, :dependent => :destroy, :inverse_of => :map

  validates_presence_of :name

  before_validation do |map|
    unless map.name.present?
      map.name = "Map #{new_record? ? (Map.count + 1) : id}"
    end
  end

  def points
    [figures.reject {|f| f.deleted_at }, walls, images].map {|c| c.map {|o| o.points }.flatten }.flatten
  end
end
