Combat.figures = {
  init: function(json) {
    var that = this;
    this.all = $.map(json, function(json) { return new that.create(json); });
    this.url = Combat.url + '/figures';
  },

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
      return parts.concat(arguments).join('/');
    }

    this.data = function() {
      var result = {};
      $.each(this.fields, function(i, field) { result[field] = this.attrs[field]; });
      return result;
    }

    this.save = function() {
      if (this.attrs.id == null) {
        var that = this;
        $.ajax({ type: 'POST', url: this.url(), data: this.data(), success: function(results) { that.load(results, 'id'); } });
      } else {
        $.ajax({ type: 'PUT', url: this.url(), data: this.data() });
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
      $.ajax({ type: 'POST', url: this.url('enlarge'), success: function(results) { that.load(results); } });
      Combat.draw();
    }

    this.reduce = function() {
      var that = this;
      $.ajax({ type: 'POST', url: this.url('reduce'), success: function(results) { that.load(results); } });
      Combat.draw();
    }

    this.scale = function() {
      var sizes = { L: 2, H: 3, G: 4, C: 6 };
      var scale = sizes[this.size];
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
      return target.x >= this.tile.x && target.x < this.tile.x + scale &&
        target.y >= this.tile.y && target.y < this.tile.y + scale;
    }

    this.center = function() {
      var scale = this.scale();
      return {
        x: scale / 2 + this.tile.corner.x,
        y: scale / 2 + this.tile.corner.y
      }
    }

    this.draw = function(context) {
      console.log("drawing", this);
      context.save();
      var scale = this.scale();
      context.fillStyle = 'rgba(100, 100, 100, 0.3)';
      context.translate(this.tile.corner.x, this.tile.corner.y);
      context.fillRect(0, 0, scale, scale);
      context.fillStyle = 'rgba(0, 0, 0, 1)';
      this.drawLetter(context);
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

    this.load(json, 'id');
  }
}

