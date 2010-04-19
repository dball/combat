class Map < ActiveRecord::Base
  has_many :figures, :dependent => :destroy
  has_many :walls, :dependent => :destroy
end
