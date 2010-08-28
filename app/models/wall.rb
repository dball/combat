class Wall < ActiveRecord::Base
  KINDS = %w(wall drawing).freeze

  belongs_to :map
  has_many :vertices, :dependent => :destroy, :order => 'vertices.id'

  validates_inclusion_of :kind, :in => KINDS

  def vertex_values=(values)
    return if values.empty?
    vertices.clear
    values.to_a.sort_by {|key, value| key.to_i }.each {|key, value| vertices.build(value.slice(:x, :y)) }
  end

  def points
    return [] if vertices.empty?
    [Vertex.new(:x => vertices.map {|v| v.x }.min - 1, :y => vertices.map {|v| v.y }.min - 1),
      Vertex.new(:x => vertices.map {|v| v.x}.max + 1, :y => vertices.map {|v| v.y }.max + 1)]
  end
end

class Vertex < ActiveRecord::Base
  belongs_to :wall
end
