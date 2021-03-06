Combat.pictures = {
  init: function(json) {
    this.all = _(json).chain()
      .map(function(json) { return new this.build(json); }, this)
      .compact()
      .value();
    this.url = Combat.url + '/images';
  },

  draw: function(context) { _(this.all).each(function() { this.draw(context); }); },

  create: function(attrs) {
    var picture = new Combat.pictures.build(attrs);
    Combat.pictures.all.push(picture);
    picture.save();
    return picture;
  },

  build: function(json) {
    this.type = 'picture';
    this.attrs = {};
    this.tile = null;
    this.fields = ['x', 'y', 'width', 'height', 'url'];

    this.load = function(json) {
      var args = Array.prototype.slice.call(arguments);
      var fields = this.fields.concat(args.slice(1));
      _(fields).each(function(field) { if (json[field] !== undefined) { this.attrs[field] = json[field]; } }, this);
      if (this.attrs.url) {
        this.img = new Image();
        this.img.onload = _.bind(function(arg) { if (this.attrs.x && this.attrs.y) { Combat.draw(); } }, this);
        this.img.src = this.attrs.url;
      }
      this.tile = Combat.map.points.create(this.attrs).tile;
    };

    this.draw = function(context) {
      if (this.attrs.x !== null && this.attrs.y !== null && this.img && this.img.complete) {
        context.drawImage(this.img, this.attrs.x, this.attrs.y, this.attrs.width, this.attrs.height);
      }
    };

    this.drawBorder = function(context) {
      context.strokeRect(this.attrs.x, this.attrs.y, this.attrs.width, this.attrs.height);
    };

    this.drawResizeHandle = function(context, point) {
      context.save();
      context.translate(this.attrs.x, this.attrs.y);
      var projected = this.project(point);
      var width = this.attrs.width;
      var height = this.attrs.height;

      context.lineWidth = Math.max(width * 0.01, height * 0.01, 0.1) / 2;

      context.strokeStyle = '#666';
      context.strokeRect(0, 0, projected.x, projected.y);

      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(projected.x, projected.y);
      context.stroke();

      context.strokeStyle = '#000';
      context.lineWidth = context.lineWidth * 2;

      context.beginPath();
      context.moveTo(width * 0.1, 0);
      context.lineTo(0, 0);
      context.lineTo(0, height * 0.1);
      context.stroke();

      context.beginPath();
      context.moveTo(width * 0.9, height);
      context.lineTo(width, height);
      context.lineTo(width, height * 0.9);
      context.stroke();

      context.globalAlpha = 0.5;
      context.drawImage(this.img, 0, 0, projected.x, projected.y);

      context.restore();
    };

    this.project = function(point) {
      var p = point.minus(this.attrs);
      if (p.x < 1) { p.x = 1; }
      if (p.y < 1) { p.y = 1; }
      var aspect = {
        required: this.attrs.width / this.attrs.height,
        actual: p.x / p.y
      };
      if (aspect.actual > aspect.required) {
        p.y = p.x / aspect.required;
      } else if (aspect.actual < aspect.required) {
        p.x = p.y * aspect.required;
      }
      return Combat.map.points.create({ x: p.x, y: p.y });
    };

    this.contains = function(point) {
      var offset = { x: point.x - this.attrs.x, y: point.y - this.attrs.y };
      if (offset.x < 0 || offset.y < 0 || offset.x > this.attrs.width || offset.y > this.attrs.height) { return null; }
      var border = Math.max(1, this.attrs.width * 0.1, this.attrs.height * 0.1);
      if (
        (offset.x >= 0 && offset.x < border) ||
        (offset.x <= this.attrs.width && offset.x > this.attrs.width - border) ||
        (offset.y >= 0 && offset.y < border) ||
        (offset.y <= this.attrs.height && offset.y > this.attrs.height - border)
      ) {
        return offset;
      }
      return null;
    };

    this.move = function(point) {
      this.tile = point.tile;
      // TODO should pictures be tile-aligned?
      this.attrs.x = point.tile.x;
      this.attrs.y = point.tile.y;
      this.save();
    };

    this.resizeTo = function(point) {
      var projection = this.project(point, true);
      this.attrs.width = projection.x;
      this.attrs.height = projection.y;
      this.save();
    };

    this.url = function() {
      var parts = [Combat.pictures.url];
      if (this.attrs.id) { parts.push(this.attrs.id); }
      var args = Array.prototype.slice.call(arguments);
      return parts.concat(args).join('/');
    };

    this.params = function() {
      var params = {};
      _(this.fields).each(function(field) { params['image[' + field + ']'] = this.attrs[field]; }, this);
      return params;
    };

    this.save = function() {
      if (!this.attrs.id) {
        $.ajax({ type: 'POST', url: this.url(), data: this.params() })
          .success(_.bind(function(json) { this.load(json, 'id'); }, this));
      } else {
        $.ajax({ type: 'PUT', url: this.url(), data: this.params() });
      }
    };

    this.destroy = function() {
      var index = Combat.pictures.all.indexOf(this);
      if (index !== null) { throw 'selected does not appear in the list of pictures'; }
      Combat.pictures.all.splice(index, 1);
      $.ajax({ type: 'DELETE', url: this.url() });
    };

    this.load(json, 'id');
  }
};
