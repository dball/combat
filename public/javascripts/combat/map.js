Combat.map = {
  init: function(json, id, viewport_id) {
    this.canvas = document.getElementById(id);
    this.context = this.canvas.getContext('2d');
  },
  tiles:  {},
  draw: function() {
    this.context.save();
    this.context.beginPath();
    for (var i=Math.ceil(this.viewport.left), right = Math.floor(this.viewport.left + this.viewport.width); i <= right; i++) {
      this.context.moveTo(i, this.viewport.top);
      this.context.lineTo(i, this.viewport.top + this.viewport.height);
    }
    for (var i=Math.ceil(this.viewport.top), bottom = Math.floor(this.viewport.top + this.viewport.height); i <= bottom; i++) {
      this.context.moveTo(this.viewport.left, i);
      this.context.lineTo(this.viewport.left + this.viewport.width, i);
    }
    this.context.lineWidth = 0.02;
    this.context.strokeStyle = 'rgba(100, 100, 100, 1)';
    this.context.stroke();
    this.context.restore();
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
  },
  getTileByPixel: function(x, y) {
    var position = $(this.canvas).position();
    return this.getTileByPosition(
      Math.floor(this.viewport.left + (x - position.left) / this.tiles.size),
      Math.floor(this.viewport.top + (y - position.top) / this.tiles.size)
    );
  },
  getIntersectionByPixel: function(x, y) {
    return this.getTileByPixel(x + this.tiles.size / 2, y + this.tiles.size / 2);
  },
  getTileByPosition: function(x, y) {
    if (x == null || y == null) {
      throw 'Invalid tile position ' + x + ',' + y;
    }
    var key = '' + x + ',' + y;
    var tile = this.tiles[key];
    if (tile == null) {
      tile = this.tiles[key] = {
        x: x,
        y: y,
        corner: { x: x, y: y },
        center: { x: (x + 0.5), y: (y + 0.5) }
      }
    }
    return tile;
  }
}
