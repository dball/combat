class Map < ActiveRecord::Base
  has_many :figures
  has_many :walls
end
