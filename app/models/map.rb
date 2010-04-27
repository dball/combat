class Map < ActiveRecord::Base
  has_many :viewports, :dependent => :destroy
  has_many :figures, :dependent => :destroy
  has_many :walls, :dependent => :destroy

  def points
    figures + walls.map {|wall| wall.vertices }.flatten
  end
end
