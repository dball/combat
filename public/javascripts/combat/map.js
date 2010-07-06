Combat.map = {
  init: function(json, id, viewport_id) {
    this.canvas = document.getElementById(id);
    this.context = this.canvas.getContext('2d');
  },
  tiles: {},
  point: function(pixel) {
    var position = $(Combat.map.canvas).position();
    return this.points.create({
      x: Combat.map.viewport.left + (pixel.x - position.left) / this.tiles.size,
      y: Combat.map.viewport.top + (pixel.y - position.top) / this.tiles.size
    });
  },
  points:  {
    create: function(point) {
      return {
        type: 'point',
        x: point.x,
        y: point.y,
        minus: function(point) { return Combat.map.points.create({ x: this.x - point.x, y: this.y - point.y }); },
        plus: function(point) { return Combat.map.points.create({ x: this.x + point.y, y: this.y + point.y }); },
        tile: {
          x: Math.floor(point.x),
          y: Math.floor(point.y),
          equals: function(tile) { return this.x == tile.x && this.y == this.y; },
          minus: function(tile) { return Combat.map.points.create({ x: this.x - tile.x, y: this.y - tile.y }).tile; }
        },
      }
    },
  },
  draw: function() {
    var context = this.context;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.restore();

    context.save();
    context.beginPath();
    for (var i=Math.ceil(this.viewport.left), right = Math.floor(this.viewport.left + this.viewport.width); i <= right; i++) {
      context.moveTo(i, this.viewport.top);
      context.lineTo(i, this.viewport.top + this.viewport.height);
    }
    for (var i=Math.ceil(this.viewport.top), bottom = Math.floor(this.viewport.top + this.viewport.height); i <= bottom; i++) {
      context.moveTo(this.viewport.left, i);
      context.lineTo(this.viewport.left + this.viewport.width, i);
    }
    context.lineWidth = 0.02;
    context.strokeStyle = 'rgba(100, 100, 100, 1)';
    context.stroke();
    context.restore();
    for (var i=0, l=arguments.length; i < l; i++) { arguments[i].draw(context); }
  },
  setContext: function() {
    this.tiles.size = (this.canvas.width * 1.0 / this.viewport.width) * this.viewport.scale;
    this.context.setTransform(this.tiles.size, 0, 0, this.tiles.size, 0, 0);
    this.context.translate(-this.viewport.left, -this.viewport.top);
  },
  viewport: {
    load: function(results) {
      this.left = results.left;
      this.top = results.top;
      this.width = results.width;
      this.height = results.height;
      this.scale = results.scale;
      Combat.map.setContext();
      Combat.draw();
    },
    reset: function() {
      var that = this;
      $.ajax({ type: 'POST', url: Combat.url + "/reset",
        data: { aspect: Combat.map.canvas.width * 1.0 / Combat.map.canvas.height },
        success: function(results) { that.load(results); }
      });
    },
    zoom: function(direction) {
      var that = this;
      $.ajax({ type: 'POST', url: Combat.url + "/zoom",
        data: { direction: direction },
        success: function(results) { that.load(results); }
      });
    },
    pan: function(direction, axis) {
      var that = this;
      $.ajax({ type: 'POST', url: url + "/pan",
        data: { direction: direction, axis: axis },
        success: function(results) { that.load(results); }
      });
    }
  }
}
