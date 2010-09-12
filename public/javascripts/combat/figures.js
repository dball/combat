Combat.figures = {
  init: function(json) {
    var that = this;
    this.all = $.map(json, function(json) { if (!json.deleted_at) { return new that.build(json); } });
    this.url = Combat.url + '/figures';
  },

  sizes: {
    M: 1,
    L: 2,
    H: 3,
    G: 4,
    C: 6,
    order: ['M', 'L', 'H', 'G', 'C'],
    larger: function(size) {
      var index = this.order.indexOf(size);
      if (index == -1 || index == this.order.length - 1) { return this.order[this.order.length - 1]; }
      return this.order[index + 1];
    },
    smaller: function(size) {
      var index = this.order.indexOf(size);
      if (index == -1 || index == 0) { return this.order[0]; }
      return this.order[index - 1];
    }
  },

  draw: function(context) { $.each(this.all, function() { this.draw(context); }); },

  create: function(attrs) {
    var figure = new Combat.figures.build(attrs);
    Combat.figures.all.push(figure);
    figure.save();
    return figure;
  },

  build: function(json) {
    this.type = 'figure';
    this.attrs = {};
    this.tile = null;
    this.fields = ['size', 'letter', 'position_x', 'position_y', 'subscript', 'color_json', 'bgcolor_json', 'kind'];

    this.load = function(json) {
      var that = this;
      var args = Array.prototype.slice.call(arguments);
      var fields = this.fields.concat(args.slice(1));
      $.each(fields, function(i, field) { if (!(json[field] === undefined)) { that.attrs[field] = json[field]; } });
      this.tile = Combat.map.points.create({ x: this.attrs.position_x, y: this.attrs.position_y }).tile;
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
        $.ajax({ type: 'POST', url: this.url(), data: this.params(), success: function(json) {
          if (json.subscript == '1') {
            $.each(Combat.figures.all, function(i, v) {
              if (this.attrs.letter == that.attrs.letter) { this.attrs.subscript = '0'; }
            });
          }
          that.load(json, 'id');
          Combat.draw();
        } });
      } else {
        $.ajax({ type: 'PUT', url: this.url(), data: this.params() });
      }
    }

    this.destroy = function() {
      var all = Combat.figures.all;
      var index = all.indexOf(this);
      if (index == null) { throw 'selected does not appear in the list of figures'; }
      all.splice(index, 1);
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
      var scale = Combat.figures.sizes[this.attrs.size];
      return (scale ? scale : 1);
    }

    this.move = function(point) {
      this.tile = point.tile;
      this.attrs.position_x = this.tile.x;
      this.attrs.position_y = this.tile.y;
      this.save();
    }

    this.contains = function(point) {
      var scale = this.scale();
      var offset = { x: point.x - this.tile.x, y: point.y - this.tile.y };
      return ((offset.x >= 0 && offset.x < scale && offset.y >= 0 && offset.y < scale) ? offset : null);
    }

    this.draw = function(context) {
      context.save();
      var scale = this.scale();
      context.fillStyle = this.attrs.bgcolor_json || 'rgba(100, 100, 100)';
      context.strokeStyle = this.attrs.color_json || 'black';
      context.translate(this.tile.x, this.tile.y);
      context.save();
      context.globalAlpha = 0.3;
      context.fillRect(0, 0, scale, scale);
      context.restore();
      this.drawLetter(context);
      context.restore();
    }

    this.drawLetter = function(context) {
      var scale = this.scale();
      var font_size = scale * 0.7;
      var text_width = get_textWidth(this.attrs.letter, font_size);
      if (!this.attrs.subscript) {
        context.strokeText(this.attrs.letter, (scale - text_width) / 2, 0, font_size);
      } else {
        var sub_font_size = scale * 0.3;
        var sub_text_width = get_textWidth(this.attrs.subscript, sub_font_size);
        var offset = {
          x: scale - sub_text_width * 1.25,
          y: scale - sub_text_width * 1.5
        };
        context.strokeText(this.attrs.letter, (scale - text_width) / 2 - sub_text_width * 0.5, 0, font_size);
        context.strokeText(this.attrs.subscript, offset.x, offset.y, sub_font_size);
      }
      // iPad OS 3.0 doesn't support native canvas fillText, so we use the strokeText.js library instead
      /*
      // Firefox and Safari were both having issues with 1px fonts, so we scale by 10 as a workaround
      context.scale(0.1, 0.1);
      var scale = this.scale() * 10;
      var offset = scale / 2;
      context.font = '' + scale + 'px courier';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(this.attrs.letter, offset, offset);
      context.restore();
      */
    }

    this.drawBorder = function(context) {
      var scale = this.scale();
      context.strokeRect(this.tile.x, this.tile.y, scale, scale);
    }

    this.load(json, 'id');
  }
}

