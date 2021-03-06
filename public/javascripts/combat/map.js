Combat.map = {
  init: function(json, id, viewport_id) {
    this.canvas = document.getElementById(id);
    this.resize(false);
    this.context = this.canvas.getContext('2d');
    // Decorate canvas with strokeText mixin
    set_textRenderContext(this.context);
  },
  resize: function(reset) {
    this.canvas.width = $('#viewport').width();
    this.canvas.height = window.innerHeight;
    if (reset) { _.delay(this.throttledReset, 500); }
  },
  throttledReset: _.throttle(function() { Combat.map.viewport.reset(); }, 500),
  tiles: {},
  point: function(evt) {
    var position = $(Combat.map.canvas).position();
    return this.points.create({
      x: Combat.map.viewport.left + (evt.pageX - position.left) / this.tiles.size,
      y: Combat.map.viewport.top + (evt.pageY - position.top) / this.tiles.size
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
          minus: function(tile) { return Combat.map.points.create({ x: this.x - tile.x, y: this.y - tile.y }).tile; }
        }
      };
    },
    line: function(t0, t1) {
      var results = [];
      var x0 = t0.x, y0 = t0.y, x1 = t1.x, y1 = t1.y, tmp;
      var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
      if (steep) {
        tmp = x0; x0 = y0; y0 = tmp;
        tmp = x1; x1 = y1; y1 = tmp;
      }
      if (x0 > x1) {
        tmp = x0; x0 = x1; x1 = tmp;
        tmp = y0; y0 = y1; y1 = tmp;
      }
      var dx = x1 - x0;
      var dy = Math.abs(y1 - y0);
      var error = dx / 2;
      var y = y0;
      var ystep = (y0 < y1 ? 1 : -1);
      for (var x = x0; x <= x1; x++) {
        results.push(steep ? { x: y, y: x } : { x: x, y: y });
        error = error - dy;
        if (error < 0) {
          y = y + ystep;
          error = error + dx;
        }
      }
      return $.map(results, function(attrs) { return Combat.map.points.create(attrs); });
    }
  },
  draw: function() {
    var context = this.context;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.restore();

    context.save();
    context.beginPath();
    var i;
    for (i = Math.ceil(this.viewport.left), right = Math.floor(this.viewport.left + this.viewport.width); i <= right; i++) {
      context.moveTo(i, this.viewport.top);
      context.lineTo(i, this.viewport.top + this.viewport.height);
    }
    for (i = Math.ceil(this.viewport.top), bottom = Math.floor(this.viewport.top + this.viewport.height); i <= bottom; i++) {
      context.moveTo(this.viewport.left, i);
      context.lineTo(this.viewport.left + this.viewport.width, i);
    }
    context.lineWidth = 0.02;
    context.strokeStyle = 'rgba(100, 100, 100, 1)';
    context.stroke();
    context.restore();
    for (i = 0, l = arguments.length; i < l; i++) { arguments[i].draw(context); }
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
      var data = { aspect: Combat.map.canvas.width * 1.0 / Combat.map.canvas.height };
      $.ajax({ type: 'POST', url: Combat.url + "/reset", data: data })
        .success(_.bind(function(results) { this.load(results); }, this));
    },
    zoom: function(direction) {
      var that = this;
      $.ajax({ type: 'POST', url: Combat.url + "/zoom", data: { direction: direction } })
        .success(_.bind(function(results) { this.load(results); }, this));
    },
    pan: function(direction, axis) {
      var that = this;
      $.ajax({ type: 'POST', url: Combat.url + "/pan", data: { direction: direction, axis: axis } })
        .success(_.bind(function(results) { this.load(results); }, this));
    }
  },
  drawTooltip: function(context, point, message) {
    context.save();
    context.translate(point.x, point.y);
    var pixel_scale = 1 / Combat.map.tiles.size;
    context.scale(pixel_scale, pixel_scale);
    context.translate(0, 30);

    context.save();
    context.fillStyle = 'rgba(244, 247, 156, 1)';
    var x = -26, y = -12, w = 52, h = 24;
    context.fillRect(x, y, w, h);
    context.strokeStyle = '#333';
    context.strokeRect(x, y, w, h);
    context.restore();

    context.save();
    context.font = '18px helvetica';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, 0, 0);
    context.restore();

    context.restore();
  },
  distance: function(points) {
    var distance = 0;
    var dmod = 0;
    for (var p = points[0], i = 1, l = points.length; i < l; i++) {
      var pi = points[i];
      if (p.x != pi.x && p.y != pi.y) {
        if (dmod === 0) { dmod = 1; distance += 5; } else { dmod = 0; distance += 10; }
      } else {
        distance += 5;
      }
      p = pi;
    }
    return distance;
  }
};
