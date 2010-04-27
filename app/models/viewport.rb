class Viewport
  include ActiveModel::Serialization

  ZOOM_FACTOR = 1.25
  PAN_PERCENT = 0.25
  MIN_SIZE = 20

  attr_reader :id
  attr_accessor :left, :top, :width, :height, :aspect, :scale

  def initialize(map, attributes = {})
    @id = map.id
    self.attributes = attributes
    self.aspect ||= 1.0
    reset(map)
  end

  def attributes=(attributes)
    attributes.each_pair do |key, value|
      send(key.to_s + '=', value.to_f)
    end
  end

  def center
    { :x => left + width.to_f / 2, :y => top + height.to_f / 2 }
  end

  def size
    { :width => width, :height => height }
  end

  def zoom(direction)
    operator = case direction
      when '-' then :*
      when '+' then :/
      else
        raise ArgumentError, 'direction: ' + direction
    end
    
    old_width = width
    old_height = height
    
    self.width = old_width.send(operator, ZOOM_FACTOR)
    self.left = left + old_width / 2.0 - width / 2.0

    self.height = old_height.send(operator, ZOOM_FACTOR)
    self.top = top + old_height / 2.0 - height / 2.0

    self
  end

  def pan(direction, axis)
    scalar = PAN_PERCENT * case direction
      when '-' then -1
      when '+' then 1
      else
        raise ArgumentError, 'direction: ' + direction
    end
    case axis
      when 'x' then self.left += width * scalar
      when 'y' then self.top += height * scalar
      else
        raise ArgumentError, 'axis: ' + axis
    end
    self
  end

  def reset(map)
    unless @id == map.id
      raise ArgumentError, "map mismatch"
    end
    self.scale = 1.0
    points = map.points
    if points.empty?
      self.left = -(MIN_SIZE / 2.0)
      self.top = -(MIN_SIZE / 2.0)
      self.width = MIN_SIZE
      self.height = MIN_SIZE
    else
      x = points.map {|p| p.x }
      y = points.map {|p| p.y }
      self.left = x.min
      self.top = y.min
      if (self.width = x.max - left) < MIN_SIZE
        delta = MIN_SIZE - width
        self.width = MIN_SIZE
        self.left = x.min - (delta.to_f / 2)
      end
      if (self.height = y.max - top) < MIN_SIZE
        delta = MIN_SIZE - height
        self.height = MIN_SIZE
        self.top = y.min - (delta.to_f / 2)
      end
    end
    required = aspect
    actual = width.to_f / height
    if actual > required # map is wider, tack on to the top and bottom
      new_height = width / required.to_f
      self.top -= (new_height - height) / 2.0
      self.height = new_height
    elsif actual < required # map is skinnier, tack on to the sides
      new_width = height * required
      self.left -= (new_width - width) / 2.0
      self.width = new_width
    end
  end
end
