class Wall < ActiveRecord::Base
  belongs_to :map
  has_many :vertices, :dependent => :destroy

  def vertex_values=(values)
    vertices.clear
    values.values.each {|vertex| vertices.build(vertex.slice(:x, :y)) }
  end

  def points
    vertices.map {|v| { :x => v.x, :y => v.y } }
  end
end

class Vertex < ActiveRecord::Base
  belongs_to :wall
end
