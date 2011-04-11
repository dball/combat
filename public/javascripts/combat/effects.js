Combat.effects = {
  init: function(json) {
    this.all = _(json).map(function(json) { return new this.build(json); }, this);
    this.url = Combat.url + '/effects';
  },

  sizes: {
    values: [1, 2, 3, 4, 6],
    larger: function(size) {
      var index = this.values.indexOf(size);
      if (index == -1 || index == this.values.length - 1) { return this.values[this.values.length - 1]; }
      return this.values[index + 1];
    },
    smaller: function(size) {
      var index = this.values.indexOf(size);
      if (index == -1 || index === 0) { return this.values[0]; }
      return this.values[index - 1];
    }
  },

  draw: function(context) { _(this.all).each(function(effect) { effect.draw(context); }); },

  create: function(attrs) {
    var effect = new Combat.effects.build(attrs);
    Combat.effects.all.push(effect);
    effect.save();
    return effect;
  },

  build: function(json) {
    this.type = 'effect';
    this.attrs = {};
    this.fields = ['x', 'y', 'shape', 'size'];

    this.load = function(json) {
      var args = Array.prototype.slice.call(arguments);
      var fields = this.fields.concat(args.slice(1));
      _(fields).each(function(field) { if (json[field] !== undefined) { this.attrs[field] = json[field]; } }, this);
      this.tile = Combat.map.points.create({ x: this.attrs.x, y: this.attrs.y }).tile;
    };

    this.url = function() {
      var parts = [Combat.effects.url];
      if (this.attrs.id) { parts.push(this.attrs.id); }
      var args = Array.prototype.slice.call(arguments);
      return parts.concat(args).join('/');
    };

    this.params = function() {
      var params = {};
      _(this.fields).each(function(field) { params['effect[' + field + ']'] = this.attrs[field]; }, this);
      return params;
    };

    this.save = function() {
      if (this.attrs.id === null) {
        $.ajax({ type: 'POST', url: this.url(), data: this.params() })
          .success(_.bind(function(json) { this.load(json, 'id'); }, this));
      } else {
        $.ajax({ type: 'PUT', url: this.url(), data: this.params() });
      }
    };

    this.destroy = function() {
      var all = Combat.effects.all;
      var index = all.indexOf(this);
      if (index === null) { throw 'selected does not appear in the list of effects'; }
      all.splice(index, 1);
      $.ajax({ type: 'DELETE', url: this.url() });
    };

    this.move = function(point) {
      this.tile = point.tile;
      this.attrs.x = this.tile.x;
      this.attrs.y = this.tile.y;
      this.save();
    };

    this.draw = function(context, lineWidth) {
      context.save();
      context.strokeStyle = 'blue';
      context.lineWidth = lineWidth || 0.1;
      if (this.attrs.shape == 'circle') {
        context.beginPath();
        context.arc(this.tile.x, this.tile.y, this.attrs.size, 0, Math.PI * 2, true);

        var hatch = this.attrs.size / 4;
        //context.closePath();
        //context.stroke();

        //context.beginPath();
        context.moveTo(this.tile.x, this.tile.y - hatch);
        context.lineTo(this.tile.x, this.tile.y + hatch);
        //context.closePath();
        //context.stroke();

        //context.beginPath();
        context.moveTo(this.tile.x - hatch, this.attrs.y);
        context.lineTo(this.tile.x + hatch, this.attrs.y);
        context.closePath();
        context.stroke();
      } else {
        throw 'Unsupported shape ' + shape;
      }
      context.restore();
    };

    this.contains = function(point, evt) {
      if (this.attrs.shape == 'circle') {
        var distance = Math.sqrt(Math.pow(point.x - this.tile.x, 2) + Math.pow(point.y - this.tile.y, 2));
        if (Math.abs(distance - this.attrs.size) < 0.25) {
          return { x: point.x - this.tile.x, y: point.y - this.tile.y };
        }
      } else {
        throw 'Unsupported shape ' + shape;
      }
    };

    this.drawBorder = function(context) {
      context.save();
      context.shadowBlur = 5;
      this.draw(context, 0.2);
      context.restore();
    };

    this.load(json, 'id');
  }
};
