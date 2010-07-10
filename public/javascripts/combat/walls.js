Combat.walls = {
  init: function(json) {
    var that = this;
    this.all = $.map(json, function(json) { return new that.build(json); });
    this.url = Combat.url + '/walls';
  },

  draw: function(context) { $.each(this.all, function() { this.draw(context); }); },

  create: function(attrs) {
    var wall = new Combat.walls.build(attrs);
    Combat.walls.all.push(wall);
    wall.save();
    return wall;
  },

  build: function(json) {
    this.type = 'wall';
    this.attrs = {};
    this.fields = ['vertices'];

    this.load = function(json) {
      var that = this;
      var args = Array.prototype.slice.call(arguments);
      var fields = this.fields.concat(args.slice(1));
      $.each(fields, function(i, field) { if (!(json[field] === undefined)) { that.attrs[field] = json[field]; } });
    }

    this.url = function() {
      var parts = [Combat.walls.url];
      if (this.attrs.id) { parts.push(this.attrs.id); }
      var args = Array.prototype.slice.call(arguments);
      return parts.concat(args).join('/');
    }

    this.params = function() {
      var params = {};
      params['wall[vertex_values]'] = $.map(this.attrs.vertices, function(vertex) { return { x: vertex.x, y: vertex.y }; });
      return params;
    }

    this.save = function() {
      if (this.attrs.id == null) {
        var that = this;
        $.ajax({ type: 'POST', url: this.url(), data: this.params(), success: function(json) { that.load(json, 'id') } });
      } else {
        $.ajax({ type: 'PUT', url: this.url(), data: this.params() });
      }
    }

    this.move = function(point) {
      var offset = { x: point.tile.x - this.tile.x, y: point.tile.y - this.tile.y };
      $.each(this.attrs.vertices, function() { this.x += offset.x; this.y += offset.y; });
      this.save();
    }

    this.contains = function(point, evt) {
      for (var i=0, l = this.attrs.vertices.length; i < l; i++) {
        var v = this.attrs.vertices[i];
        if (Math.sqrt(Math.pow(point.x - v.x, 2) + Math.pow(point.y - v.y, 2)) < 0.25) {
          return { x: point.x - this.tile.x, y: point.y - this.tile.y };
        }
      }
    }

    this.draw = function(context) {
      this.drawVertices(context, 0.15);
    }

    this.drawVertices = function(context, lineWidth) {
      if (this.attrs.vertices.length <= 1) { return; }
      context.save();
      context.lineWidth = lineWidth
      var v = this.attrs.vertices[0];
      context.beginPath(v.x, v.y);
      for (var i=1, l=this.attrs.vertices.length; i < l; i++) { v = this.attrs.vertices[i]; context.lineTo(v.x, v.y); }
      context.stroke();
      context.restore();
    }

    this.drawBorder = function(context) {
      context.save();
      context.shadowBlur = 5;
      this.drawVertices(context, 0.2);
      context.restore();
    }

    this.load(json, 'id');
  }
}
