class Map < ActiveRecord::Base
  has_many :viewports, :dependent => :destroy
  has_many :figures, :dependent => :destroy, :inverse_of => :map, :order => 'figures.id'
  has_many :walls, :dependent => :destroy, :order => 'walls.id'
  has_many :images, :dependent => :destroy, :order => 'images.id'
  has_many :effects, :dependent => :destroy, :inverse_of => :map, :order => 'effects.id'
  has_one :specific_palette, :dependent => :destroy, :inverse_of => :map, :class_name => 'Palette'

  validates_presence_of :name

  before_validation do |map|
    unless map.name.present?
      map.name = "Map #{new_record? ? (Map.count + 1) : id}"
    end
  end

  def points
    [figures.reject {|f| f.deleted_at }, walls, images].map {|c| c.map {|o| o.points }.flatten }.flatten
  end

  delegate :color, :to => :palette

  def palette
    specific_palette || Palette.find(:first, :conditions => { :map_id => nil })
  end
end
