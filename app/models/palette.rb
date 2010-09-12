class Palette < ActiveRecord::Base
  belongs_to :map, :inverse_of => :specific_palette
  has_many :colors, :inverse_of => :palette, :dependent => :destroy, :order => 'colors.id'

  def color(figure)
    figure.specific_color || colors.detect {|color| figure.kind == color.kind } || Figure::KINDS[figure.kind] || Figure::DEFAULT_COLOR
  end

  class Color < ActiveRecord::Base
    set_table_name :colors

    belongs_to :palette, :inverse_of => :colors
    has_many :figures, :inverse_of => :specific_color, :dependent => :nullify
  
    validates_numericality_of :red, :green, :blue, :greater_than_or_equal_to => 0, :less_than => 256
    validates_numericality_of :alpha, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 1
    # validates_inclusion_of :kind, :in => Figure.kinds, :allow_blank => true

    def to_rgb
      ::Color::RGB.new(red, green, blue)
    end
  
    def to_css
      "rgba(#{[red.to_i, green.to_i, blue.to_i, alpha].join(', ')})"
    end
  
    def to_json
      to_rgb.html
    end
  end
end
