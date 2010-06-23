Combat.figures = {
  init: function(json) {
    var that = this;
    this.all = $.map(json, function(json) { return new that.create(json); });
    this.url = Combat.url + '/figures';
  },

  draw: function(context) { $.each(this.all, function() { this.draw(context); }); },

  create: function(json) {
    this.attrs = {};
    this.tile = null;
    this.fields = ['size', 'letter', 'position_x', 'position_y'];

    this.load = function(json) {
      var that = this;
      var args = Array.prototype.slice.call(arguments);
      var fields = this.fields.concat(args.slice(1));
      $.each(fields, function(i, field) { if (!(json[field] === undefined)) { that.attrs[field] = json[field]; } });
      this.tile = Combat.map.getTileByPosition(this.attrs.position_x, this.attrs.position_y);
    }

    this.url = function() {
      var parts = [Combat.figures.url];
      if (this.attrs.id) { parts.push(this.attrs.id); }
      var args = Array.prototype.slice.call(arguments);
      return parts.concat(args).join('/');
    }

    this.params = function() {
      var params = {};
      var that = this;
      $.each(this.fields, function(i, field) { params['figure[' + field + ']'] = that.attrs[field]; });
      return params;
    }

    this.save = function() {
      if (this.attrs.id == null) {
        var that = this;
        $.ajax({ type: 'POST', url: this.url(), data: this.params(), success: function(json) { that.load(json, 'id'); } });
      } else {
        $.ajax({ type: 'PUT', url: this.url(), data: this.params() });
      }
    }

    this.destroy = function() {
      var index = Combat.figures.all.indexOf(this);
      if (index == null) { throw 'selected does not appear in the list of figures'; }
      this.all.splice(index, 1);
      $.ajax({ type: 'DELETE', url: this.url() });
    }

    this.enlarge = function() {
      var that = this;
      $.ajax({ type: 'POST', url: this.url('enlarge'), success: function(results) { that.load(results); Combat.draw(); } });
    }

    this.reduce = function() {
      var that = this;
      $.ajax({ type: 'POST', url: this.url('reduce'), success: function(results) { that.load(results); Combat.draw(); } });
    }

    this.scale = function() {
      var sizes = { L: 2, H: 3, G: 4, C: 6 };
      var scale = sizes[this.attrs.size];
      return (scale ? scale : 1);
    }

    this.move = function(tile) {
      this.tile = tile;
      this.attrs.position_x = this.tile.x;
      this.attrs.position_y = this.tile.y;
      this.save();
    }

    this.on = function(tile) {
      var scale = this.scale();
      return tile.x >= this.tile.x && tile.x < this.tile.x + scale &&
        tile.y >= this.tile.y && tile.y < this.tile.y + scale;
    }

    this.center = function() {
      var scale = this.scale();
      return {
        x: scale / 2 + this.tile.corner.x,
        y: scale / 2 + this.tile.corner.y
      }
    }

    this.draw = function(context) {
      context.save();
      var scale = this.scale();
      context.fillStyle = 'rgba(100, 100, 100, 0.3)';
      context.translate(this.tile.corner.x, this.tile.corner.y);
      context.fillRect(0, 0, scale, scale);
      context.fillStyle = 'rgba(0, 0, 0, 1)';
      this.drawLetter(context);
      if (this.selected) {
        context.save();
        scale = this.scale();
        context.lineWidth = 0.05;
        context.strokeRect(0, 0, scale, scale);
        context.restore();
      }
      context.restore();

    }

    this.drawLetter = function(context) {
      context.save();
      // Firefox and Safari were both having issues with 1px fonts, so we scale by 10 as a workaround
      context.scale(0.1, 0.1);
      var scale = this.scale() * 10;
      var offset = scale / 2;
      context.font = '' + scale + 'px courier';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(this.attrs.letter, offset, offset);
      context.restore();
    }

    this.drawCursor = function(context, tile) {
      context.save();
      context.globalAlpha = 0.5;
      context.translate(tile.x - this.tile.x, tile.y - this.tile.y);
      this.draw(context);
      context.restore();
    }

    this.load(json, 'id');
  }
}

