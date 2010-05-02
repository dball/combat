class Figure < ActiveRecord::Base
  SIZES = %w(fine diminuitive tiny small medium large huge gargantuan colossal)
  SIZE_CODES = SIZES.map {|s| s[0, 1].upcase }

  belongs_to :map
  belongs_to :character

  validates_numericality_of :position_x
  validates_numericality_of :position_y
  validates_inclusion_of :size, :in => SIZE_CODES

  def x
    position_x
  end

  def y
    position_y
  end

  def points
    [{ :x => x, :y => y }]
  end

  def enlarge
    change_size(1)
  end

  def reduce
    change_size(-1)
  end

  def change_size(incr)
    index = SIZE_CODES.index(size) + incr
    if index < 0 || index >= SIZE_CODES.length
      false
    else
      self.size = SIZE_CODES[index]
    end
  end
end
