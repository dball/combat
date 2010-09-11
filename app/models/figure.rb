class Figure < ActiveRecord::Base
  KINDS = %w(actor set prop).freeze
  DEFAULT_COLOR = Palette::Color.new(:red => 0, :green => 0, :blue => 0, :alpha => 1).freeze
  SIZES = %w(fine diminuitive tiny small medium large huge gargantuan colossal).freeze
  SIZE_CODES = SIZES.map {|s| s[0, 1].upcase }.freeze
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
  }.freeze

  belongs_to :map, :inverse_of => :figures
  belongs_to :character
  belongs_to :specific_color, :inverse_of => :figures, :class_name => 'Palette::Color', :foreign_key => :color_id

  validates_numericality_of :position_x
  validates_numericality_of :position_y
  validates_inclusion_of :size, :in => SIZE_CODES
  validates_inclusion_of :kind, :in => KINDS

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
    return nil unless ('a'..'z').include?(letter)
    matches = map.figures.select {|f| f.letter == letter }
    matches.length > 1 ?  matches.index(self).to_s : nil
  end

  def subscript=(value); end

  def color
    map.color(self)
  end

  def color=(color)
    self.specific_color = color
  end

  def color_json
    color.to_rgb.html
  end

  def color_json=(json); end

  def bgcolor_json
    hsl = color.to_rgb.to_hsl
    hsl.l = 0.6
    hsl.html
  end

  def bgcolor_json=(json); end
end
