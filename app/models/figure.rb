class Figure < ActiveRecord::Base
  SIZES = %w(fine diminuitive tiny small medium large huge gargantuan colossal)
  SIZE_CODES = SIZES.map {|s| s[0, 1].upcase }
  SCALES = {
    'F' => 1,
    'D' => 1,
    'T' => 1,
    'S' => 1,
    'M' => 1,
    'L' => 2,
    'H' => 3,
    'G' => 4,
    'C' => 6
  }

  belongs_to :map, :inverse_of => :figures
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
    scale = SCALES[size]
    [{ :x => x, :y => y }, { :x => x + scale, :y => y + scale }]
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

  def destroy
    update_attribute(:deleted_at, Time.now)
  end

  def subscript
    matches = map.figures.select {|f| f.letter == letter }
    matches.length > 1 ?  matches.index(self).to_s : nil
  end
end
