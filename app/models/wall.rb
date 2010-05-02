class Wall < ActiveRecord::Base
  belongs_to :map
  has_many :vertices

  def vertex_values=(values)
    values.map {|xy| xy.split(',') }.map {|x, y| vertices.build(:x => x, :y => y) }
  end

  def points
    vertices.map {|v| { :x => v.x, :y => v.y } }
  end
end

class Vertex < ActiveRecord::Base
  belongs_to :wall
end
