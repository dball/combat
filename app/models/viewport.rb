class Viewport < ActiveRecord::Base
  FACTOR = 1.25

  belongs_to :map

  def zoom(direction)
    operator = case direction
      when '-' then :/
      when '+' then :*
      else
        raise ArgumentError, 'direction: ' + direction
    end
    self.scale = scale.send(operator, FACTOR)
  end

  def pan(direction, axis)
    scalar = case direction
      when '-' then -1
      when '+' then 1
      else
        raise ArgumentError, 'direction: ' + direction
    end
    unless %w(x y).include?(axis)
      raise ArgumentError, 'axis: ' + axis
    end
    self[axis] = self[axis] + 5 * scalar
  end
end
