var Map = function(json_arg, id_arg) {
  var json = json_arg;
  var id = id_arg;
  var selector = "#" + id;
  var canvas = document.getElementById(id);
  var context = canvas.getContext('2d');
  var tiles = new Object();
  var tile_size = Math.min(
    canvas.width / json.width,
    canvas.height / json.height
  );
  var figures = [];
  for (var i=0, l = json.figures.length; i < l; i++) {
    figures.push(new Figure(json.figures[i]));
  }
  var walls = [];
  for (var i=0, l = json.walls.length; i < l; i++) {
    walls.push(new Wall(json.walls[i]));
  }
  var selected = {
    action: null
  }
  var actions = {
    c: {
      title: 'Create figure',
      letter: null,
      tile: null,
      init: function(evt) {
        this.mousemove(evt);
      },
      keypress: function(evt) {
        this.letter = String.fromCharCode(evt.charCode);
      },
      click: function(evt) {
        var tile = getTileByPixel(evt.pageX, evt.pageY);
        var figure = new Figure({
          position_x: tile.x,
          position_y: tile.y,
          letter: this.letter,
          size: 'M'
        });
        figure.save();
        figures.push(figure);
        draw();
      },
      mousemove: function(evt) {
        var tile = getTileByPixel(evt.pageX, evt.pageY);
        if (tile != this.tile) {
          this.tile = tile;
          if (this.letter) {
            draw();
          }
        }
      },
      cancel: function() {
        if (this.letter) {
          draw();
        }
      },
      draw: function() {
        context.save();
        context.fillStyle = 'rgba(255, 0, 0, 0.25)';
        context.fillRect(
          1 + this.tile.x * tile_size,
          1 + this.tile.y * tile_size,
          tile_size - 1,
          tile_size - 1
        );
        context.restore();
      }
    },
    d: {
      title: 'Draw wall',
      wall: new Wall(),
      vertex: null,
      init: function(evt) {
        this.mousemove(evt);
      },
      keypress: function(evt) {
        if (evt.keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
          this.wall.destroy();
        }
      },
      click: function(evt) {
        var vertex = getIntersectionByPixel(evt.pageX, evt.pageY);
        this.wall.vertices.push(vertex);
        draw();
        this.draw();
      },
      mousemove: function(evt) {
        var length = this.wall.vertices.length;
        if (length > 0) {
          var vertex = getIntersectionByPixel(evt.pageX, evt.pageY);
          if (vertex != this.vertex) {
            this.vertex = vertex;
            draw();
            this.draw();
          }
        }
      },
      cancel: function() {
        if (this.wall.vertices.length > 1) {
          this.wall.save();
        }
        this.wall = new Wall();
        this.vertex = null;
        draw();
      },
      draw: function() {
        if (this.vertex != null) {
          this.wall.vertices.push(this.vertex);
          this.wall.draw();
          this.wall.vertices.pop();
        }
      }
    },
    e: {
      title: 'create Effect'
    },
    click: {
      title: 'select figure',
      index: null,
      figures: [],
      tiles: {
        start: null,
        current: null
      },
      getFigure: function() {
        return this.index != null ? this.figures[this.index] : null;
      },
      nextFigure: function() {
        var length = this.figures.length;
        if (length == 0) {
          this.cancel();
        } else if (this.index == null) {
          this.index = 0;
        } else if (this.index < length - 1) {
          this.index += 1;
        } else {
          this.cancel();
        }
      },
      init: function(evt) {
      },
      click: function(evt) {
        this.tiles.current = getTileByPixel(evt.pageX, evt.pageY);
        if (this.tiles.start == null) {
          this.tiles.start = this.tiles.current;
          this.figures = this.tiles.start.getFigures();
          this.nextFigure();
        } else if (this.tiles.start == this.tiles.current) {
          this.nextFigure();
          if (this.getFigure() == null) {
            this.cancel();
          }
        } else {
          this.getFigure().moveToTile(this.tiles.current);
          this.cancel();
        }
        draw();
      },
      mousemove: function(evt) {
        this.tiles.current = getTileByPixel(evt.pageX, evt.pageY);
        if (this.getFigure() != null) {
          draw();
        }
      },
      keypress: function(evt) {
        var figure = this.getFigure();
        if (figure != null) {
          if (evt.keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
            var index = null;
            for (var i=0, l=figures.length; i < l; i++) {
              if (figures[i] == figure) {
                index = i;
                break;
              }
            }
            if (index == null) {
              throw 'Selected figure does not exist';
            }
            figure.destroy();
            figures.splice(index, 1);
            this.cancel();
            return;
          } else if (evt.charCode != 0) {
            var key = String.fromCharCode(evt.charCode);
            switch(key) {
              case ']':
                figure.enlarge();
                draw();
                return;
              case '[':
                figure.reduce();
                draw();
                return;
            }
          }
        }
        this.cancel();
        keypress(evt);
      },
      cancel: function() {
        this.index = null;
        this.figures = [];
        this.tiles.current = null;
        this.tiles.start = null;
        selected.action = null;
        draw();
      },
      draw: function() {
        var figure = this.getFigure();
        if (figure != null) {
          context.save();
          context.fillStyle = 'rgba(255, 0, 0, 0.25)';
          var tile = this.tiles.current;
          context.translate(tile.corner.x, tile.corner.y);
          var size = figure.getSize() - 2;
          context.fillRect(1, 1, size, size);
          context.fillStyle = 'rgba(0, 0, 255, 1)'
          context.shadowOffsetX = 2;
          context.shadowOffsetY = 2;
          context.shadowBlur = 1;
          context.shadowColor = 'rgba(0, 0, 0, 0.5)';
          figure.drawLetter(context);
          context.restore();
        }
      }
    }
  }

  function getTileByPixel(x, y) {
    return getTileByPosition(Math.floor(x / tile_size), Math.floor(y / tile_size));
  }

  function getIntersectionByPixel(x, y) {
    return getTileByPixel(x + tile_size / 2, y + tile_size / 2);
  }

  function getTileByPosition(x, y) {
    if (x == null || y == null) {
      throw 'Invalid tile position ' + x + ',' + y;
    }
    var key = '' + x + ',' + y;
    var tile = tiles[key];
    return (tile != null) ? tile : tiles[key] = new Tile(x, y);
  }

  function drawGrid() {
    context.save();
    context.beginPath();
    for (var x=0.5; x < canvas.width; x += tile_size) {
      context.moveTo(x, 0.5);
      context.lineTo(x, canvas.height);
    }
    for (var y=0.5; y < canvas.height; y += tile_size) {
      context.moveTo(0.5, y);
      context.lineTo(canvas.width, y);
    }
    context.stroke();
    context.restore();
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    for (var i=0, l=figures.length; i < l; i++) {
      figures[i].draw();
    }
    for (var i=0, l=walls.length; i < l; i++) {
      walls[i].draw();
    }
    if (selected.action != null) {
      selected.action.draw();
    }
  }

  /* Event handlers */

  function click(evt) {
    if (selected.action != null) {
      selected.action.click(evt);
    } else if (actions.click != null) {
      selected.action = actions.click;
      selected.action.click(evt);
    }
  }

  function keypress(evt) {
    evt.preventDefault();
    if (selected.action != null) {
      if (evt.keyCode == KeyEvent.DOM_VK_ESCAPE) {
        action = selected.action;
        selected.action = null;
        action.cancel();
      } else {
        selected.action.keypress(evt);
      }
    } else {
      if (evt.charCode != 0) {
        selected.action = actions[String.fromCharCode(evt.charCode)];
      }
    }
  }

  function mousemove(evt) {
    if (selected.action != null) {
      selected.action.mousemove(evt);
    }
  }

  /* Child models */

  function Tile(x, y) {
    this.x = x;
    this.y = y;
    this.corner = {
      x: x * tile_size,
      y: y * tile_size
    };
    this.center = {
      x: (x + 0.5) * tile_size,
      y: (y + 0.5) * tile_size
    }

    this.getFigures = function() {
      var results = [];
      for (var i=0, l=figures.length; i < l; i++) {
        var figure = figures[i];
        if (figure.inTile(this)) {
          results.push(figure);
        }
      }
      return results;
    }
  }

  function Wall(json) {
    this.vertices = [];
    if (json == null) {
      this.id = null;
    } else {
      this.id = json.id;
      var vertex;
      for (var i=0, l=json.vertices.length; i < l; i++) {
        vertex = json.vertices[i];
        this.vertices.push(getTileByPosition(vertex.x, vertex.y));
      }
    }

    this.save = function() {
      walls.push(this);
      var vertex;
      var xy = [];
      for (var i=0, l=this.vertices.length; i < l; i++) {
        vertex = this.vertices[i];
        xy.push('' + vertex.x + ',' + vertex.y);
      }
      data = {
        'xy[]': xy,
      }
      if (this.id == null) {
        var wall = this;
        $.ajax({
          type: 'POST',
          url: window.location.href + "/walls",
          data: data,
          success: function(results) {
            wall.id = results.id;
          }
        });
      } else {
        $.ajax({
          type: 'PUT',
          url: window.location.href + "/walls/" + this.id,
          data: data
        });
      }
    }

    this.draw = function() {
      if (this.vertices.length > 1) {
        context.save();
        context.beginPath();
        var vertex = this.vertices[0];
        context.moveTo(vertex.x * tile_size, vertex.y * tile_size);
        for (var i=1, l=this.vertices.length; i < l; i++) {
          vertex = this.vertices[i];
          context.lineTo(vertex.x * tile_size, vertex.y * tile_size);
        }
        context.lineWidth = tile_size / 4;
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
          url: window.location.href + "/figures",
          data: data,
          success: function(results) {
            figure.id = results.id;
          }
        });
      } else {
        $.ajax({
          type: 'PUT',
          url: window.location.href + "/figures/" + this.id,
          data: data
        });
      }
    }

    this.enlarge = function() {
      var figure = this;
      $.ajax({
        type: 'POST',
        url: window.location.href + "/figures/" + this.id + "/enlarge",
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
        url: window.location.href + "/figures/" + this.id + "/reduce",
        success: function(results) {
          figure.size = results.size;
          draw();
        }
      });
    }

    this.destroy = function() {
      $.ajax({
        type: 'DELETE',
        url: window.location.href + "/figures/" + this.id
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

    this.getSize = function() {
      return this.getScale() * tile_size;
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
      var size = this.getSize();
      return {
        x: size / 2 + this.tile.corner.x,
        y: size / 2 + this.tile.corner.y
      }
    }

    this.draw = function() {
      context.save();
      var size = this.getSize();
      context.fillStyle = 'rgba(100, 100, 100, 0.3)';
      context.translate(this.tile.corner.x, this.tile.corner.y);
      context.fillRect(0, 0, size, size);
      context.fillStyle = 'rgba(0, 0, 0, 1)';
      this.drawLetter(context);
      context.restore();
    }

    this.drawLetter = function(context) {
      context.save();
      var size = this.getSize();
      var offset = size / 2;
      context.font = '' + size + 'px courier';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(this.letter, offset, offset);
      context.restore();
    }
  }

  function init() {
    draw();
    $(selector)
      .click(click)
      .mousemove(mousemove);
    $(document).keypress(keypress);
  }

  return {
    init: init
  }
}
