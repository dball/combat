class Figure < ActiveRecord::Base
  SIZES = %w(fine diminuitive tiny small medium large huge gargantuan colossal)

  belongs_to :map

  validates_numericality_of :position_x
  validates_numericality_of :position_y
  validates_inclusion_of :size, :in => SIZES.map {|s| s[0, 1].upcase }
end
