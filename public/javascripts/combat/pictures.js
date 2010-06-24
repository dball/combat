Combat.pictures = {
  init: function(json) {
    var that = this;
    this.all = $.map(json, function(json) { return new that.create(json); });
    this.url = Combat.url + '/images';
  },

  draw: function(context) { $.each(this.all, function() { this.draw(context); }); },

  create: function(json) {
    this.attrs = {};
    this.tile = null;
    this.fields = ['x', 'y', 'width', 'height', 'url'];

    this.load = function(json) {
      var that = this;
      var args = Array.prototype.slice.call(arguments);
      var fields = this.fields.concat(args.slice(1));
      $.each(fields, function(i, field) { if (!(json[field] === undefined)) { that.attrs[field] = json[field]; } });
      if (this.attrs.url) {
        this.img = new Image();
        var that = this;
        this.img.onload = function(arg) { if (that.attrs.x && that.attrs.y) { Combat.draw(); } }
        this.img.src = this.attrs.url;
      }
    }

    this.draw = function(context) {
      if (this.attrs.x != null && this.attrs.y != null && this.img && this.img.complete) {
        context.save();
        context.drawImage(this.img, this.attrs.x, this.attrs.y, this.attrs.width, this.attrs.height);
        if (this.selected) {
          context.lineWidth = 0.05;
          context.strokeRect(this.attrs.x, this.attrs.y, this.attrs.width, this.attrs.height);
        }
        context.restore();
      }
    }

    this.drawCursor = function(context, tile, offset) {
      context.save();
      context.globalAlpha = 0.5;
      context.translate(tile.x - this.attrs.x - offset.x, tile.y - this.attrs.y - offset.y);
      this.draw(context);
      context.restore();
    }

    this.on = function(tile) {
      var offset = { x: tile.x - this.attrs.x, y: tile.y - this.attrs.y };
      return ((offset.x >= 0 && offset.x < this.attrs.width && offset.y >= 0 && offset.y < this.attrs.height) ? offset : null);
    }

    this.move = function(tile) {
      this.attrs.x = tile.x;
      this.attrs.y = tile.y;
      this.save();
    }

    this.url = function() {
      var parts = [Combat.pictures.url];
      if (this.attrs.id) { parts.push(this.attrs.id); }
      var args = Array.prototype.slice.call(arguments);
      return parts.concat(args).join('/');
    }

    this.params = function() {
      var params = {};
      var that = this;
      $.each(this.fields, function(i, field) { params['image[' + field + ']'] = that.attrs[field]; });
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
      var index = Combat.pictures.all.indexOf(this);
      if (index == null) { throw 'selected does not appear in the list of pictures'; }
      this.all.splice(index, 1);
      $.ajax({ type: 'DELETE', url: this.url() });
    }
    /*

    this.enlarge = function() {
      var that = this;
      $.ajax({ type: 'POST', url: this.url('enlarge'), success: function(results) { that.load(results); Combat.draw(); } });
    }

    this.reduce = function() {
      var that = this;
      $.ajax({ type: 'POST', url: this.url('reduce'), success: function(results) { that.load(results); Combat.draw(); } });
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
    */

    this.load(json, 'id');
  }
}

