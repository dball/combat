class Figure < ActiveRecord::Base
  belongs_to :map

  validates_numericality_of :position_x
  validates_numericality_of :position_y
end
