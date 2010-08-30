class Palette < ActiveRecord::Base
  belongs_to :map, :inverse_of => :specific_palette
  has_many :colors, :inverse_of => :palette, :dependent => :destroy, :order => 'colors.id'

  def color(figure)
    figure.specific_color || colors.detect {|color| figure.kind == color.kind } || Figure::DEFAULT_COLOR
  end
end
