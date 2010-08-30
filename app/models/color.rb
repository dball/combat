class Color < ActiveRecord::Base
  belongs_to :palette, :inverse_of => :colors
  has_many :figures, :inverse_of => :specific_color, :dependent => :nullify

  validates_numericality_of :red, :green, :blue, :greater_than_or_equal_to => 0, :less_than => 256
  validates_numericality_of :alpha, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 1
  validates_inclusion_of :kind, :in => Figure::KINDS, :allow_blank => true

  def to_css
    "rgba(#{[red.to_i, green.to_i, blue.to_i, alpha].join(', ')})"
  end

  def to_json
    to_css
  end
end
