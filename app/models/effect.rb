class Effect < ActiveRecord::Base
  SHAPES = %w(circle cone square).freeze

  belongs_to :map, :inverse_of => :effects

  validates_inclusion_of :shape, :in => SHAPES
  validates_numericality_of :size, :greater_than => 0
  validates_numericality_of :orientation, :allow_nil => true
  validates_numericality_of :x, :y
end
