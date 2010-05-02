class Map < ActiveRecord::Base
  has_many :viewports, :dependent => :destroy
  has_many :figures, :dependent => :destroy
  has_many :walls, :dependent => :destroy
  has_many :images, :dependent => :destroy

  def points
    [figures, walls, images].map {|c| c.map {|o| o.points }.flatten }.flatten
  end
end
