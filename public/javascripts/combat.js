var Combat = {
  url: window.location.href,

  init: function(json, id, viewport_id) {
    this.map.init(json, id, viewport_id);
    this.figures.init(json.figures);
    /*
    var walls = $.map(json.walls, function(wall) { return new Wall(wall); });
    var pictures = $.map(json.images, function(image) { return new Picture(image); });
    */
    this.map.viewport.reset();
    this.actions.bind($('#' + id));
  },

  draw: function() {
    this.map.draw(this.figures, this.actions);
    //$.each(walls, function(i, wall) { wall.draw(); });
  }
}

var Map = function() {

  /* Child models */

  function Tile(x, y) {
    this.x = x;
    this.y = y;
    this.corner = { x: x, y: y }
    this.center = { x: (x + 0.5), y: (y + 0.5) }

    this.getFigures = function() {
      var tile = this;
      return results = $.grep(figures, function(figure) { return figure.inTile(tile); });
    }
  }

  function Wall(json) {
    if (json == null) {
      this.id = null;
      this.vertices = [];
    } else {
      this.id = json.id;
      this.vertices = $.map(json.vertices, function(vertex) { return getTileByPosition(vertex.x, vertex.y); });
    }

    this.save = function() {
      if (this.id == null) {
        walls.push(this);
        var wall = this;
        $.ajax({
          type: 'POST',
          url: url + "/walls",
          data: {
            'xy[]': $.map(this.vertices, function(vertex) { return '' + vertex.x + ',' + vertex.y; })
          },
          success: function(results) {
            wall.id = results.id;
          }
        });
      } else {
        $.ajax({
          type: 'PUT',
          url: url + "/walls/" + this.id,
          data: data
        });
      }
    }

    this.draw = function() {
      if (this.vertices.length > 1) {
        context.save();
        context.beginPath();
        var start = this.vertices.shift();
        context.moveTo(start.x, start.y);
        $.each(this.vertices, function(i, vertex) { context.lineTo(vertex.x, vertex.y); });
        this.vertices.unshift(start);
        context.lineWidth = 0.2;
        context.stroke();
        context.restore();
      }
    }
  }

  function Figure(json) {
    this.size = json.size;
    this.letter = json.letter;
    this.tile = getTileByPosition(json.position_x, json.position_y);
    this.id = json.id;

    this.save = function() {
      var data = {
        'figure[letter]': this.letter,
        'figure[size]': this.size,
        'figure[position_x]': this.tile.x,
        'figure[position_y]': this.tile.y
      }
      if (this.id == null) {
        var figure = this;
        $.ajax({
          type: 'POST',
          url: url + "/figures",
          data: data,
          success: function(results) {
            figure.id = results.id;
          }
        });
      } else {
        $.ajax({
          type: 'PUT',
          url: url + "/figures/" + this.id,
          data: data
        });
      }
    }

    this.destroy = function() {
      var index = figures.indexOf(this);
      if (index == null) {
        throw 'Selected figure does not exist';
      }
      figures.splice(index, 1);
      $.ajax({
        type: 'DELETE',
        url: url + "/figures/" + this.id
      });
    }

    this.enlarge = function() {
      var figure = this;
      $.ajax({
        type: 'POST',
        url: url + "/figures/" + this.id + "/enlarge",
        success: function(results) {
          figure.size = results.size;
          draw();
        }
      });
    }

    this.reduce = function() {
      var figure = this;
      $.ajax({
        type: 'POST',
        url: url + "/figures/" + this.id + "/reduce",
        success: function(results) {
          figure.size = results.size;
          draw();
        }
      });
    }

    this.getScale = function() {
      switch(this.size) {
        case 'L':
          return 2;
        case 'H':
          return 3;
        case 'G':
          return 4;
        case 'C':
          return 6;
      }
      return 1;
    }

    this.moveToTile = function(target) {
      this.tile = target;
      this.save();
    }

    this.inTile = function(target) {
      var scale = this.getScale();
      return target.x >= this.tile.x && target.x < this.tile.x + scale &&
        target.y >= this.tile.y && target.y < this.tile.y + scale;
    }

    this.getCenter = function() {
      var scale = this.getScale();
      return {
        x: scale / 2 + this.tile.corner.x,
        y: scale / 2 + this.tile.corner.y
      }
    }

    this.draw = function() {
      context.save();
      var scale = this.getScale();
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
      var scale = this.getScale() * 10;
      var offset = scale / 2;
      context.font = '' + scale + 'px courier';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(this.letter, offset, offset);
      context.restore();
    }
  }

  // I would like to name this Image, but am not sure how to construct new root Image instances if I do
  function Picture(json) {
    this.id = json.id;
    this.url = json.url;
    this.x = json.x;
    this.y = json.y;
    this.width = json.width;
    this.height = json.height;
    if (this.url != null) {
      this.img = new Image();
      var picture = this;
      this.img.onload = function(arg) {
        if (picture.x != null && picture.y != null) {
          draw();
        }
      }
      this.img.src = this.url;
    }

    this.draw = function() {
      if (this.img != null && this.img.complete && this.x != null && this.y != null) {
        context.save();
        if (this.selected) {
          context.globalAlpha = 0.5;
        }
        context.drawImage(this.img, this.x, this.y, this.width, this.height);
        context.restore();
      }
    }
  }

  function init() {
  }

  return {
    init: init
  }
}
