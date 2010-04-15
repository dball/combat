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
    figure: null,
    tile: null,
    action: null
  }
  var cursor = {
    tile: null,
    size: 1
  }
  var actions = {
    c: {
      title: 'Create figure',
      character: null,
      tile: null,
      keypress: function(evt) {
        this.character = String.fromCharCode(evt.charCode);
      },
      click: function(evt) {
        var tile = getTileByPixel(evt.pageX, evt.pageY);
        var figure = new Figure({
          position_x: tile.x,
          position_y: tile.y,
          character: this.character,
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
          if (this.character) {
            draw();
          }
        }
      },
      cancel: function() {
        if (this.character) {
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
      keypress: function(evt) {},
      click: function(evt) {
        // add a point to the wall
        // start drawing cursor
      },
      drawCursor: function(point) {
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
        if (figure != null && evt.keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
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
          context.fillRect(
            1 + tile.x * tile_size,
            1 + tile.y * tile_size,
            (tile_size - 1) * figure.getScale(),
            (tile_size - 1) * figure.getScale()
          );
          context.restore();
        }
      }
    }
  }

  function getTileByPixel(x, y) {
    return getTileByPosition(Math.floor(x / tile_size), Math.floor(y / tile_size));
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

  function oldclick(evt) {
    var last_selected_tile = selected.tile;
    tile = selected.tile = getTileByPixel(evt.pageX, evt.pageY);
    // release selected figure
    if (selected.figure) {
      return;
    }
    if (selected.action == 'd' && last_selected_tile != null) {
      var wall = new Wall({
        x0: last_selected_tile.x,
        y0: last_selected_tile.y,
        x1: selected.tile.x,
        y1: selected.tile.y
      });
      wall.save();
      walls.push(wall);
      draw();
      return;
    }
    // select a figure
  }

  function oldkeypress(evt) {
    if (selected.tile != null && selected.figure == null) {
      var character = String.fromCharCode(evt.charCode);
      switch(selected.action) {
        case null:
          switch(character) {
            case 'c':
            case 'd':
              selected.action = character;
              draw();
              break;
            default:
              selected.action = null;
          }
          break;
        case 'c':
          var figure = new Figure({
            position_x: cursor.tile.x,
            position_y: cursor.tile.y,
            character: character,
            size: 'M'
          });
          figure.save();
          figures.push(figure);
          selected.action = null;
          draw();
          break;
      }
    } else if (selected.figure != null) {
      if (evt.keyCode != 0) {
        switch(evt.keyCode) {
          case KeyEvent.DOM_VK_BACK_SPACE:
            var index = null;
            for (var i=0, l=figures.length; i < l; i++) {
              if (figures[i] == selected.figure) {
                index = i;
                break;
              }
            }
            if (index == null) {
              throw 'Selected figure does not exist';
            }
            figures.splice(index, 1);
            selected.figure.destroy();
            selected.figure = null;
            cursor.size = 1;
            draw();
            break;
          case KeyEvent.DOM_VK_ESCAPE:
            selected.action = null;
            selected.figure = null;
            cursor.size = 1;
            draw();
            break;
        }
      } else if (evt.charCode != 0) {
        var character = String.fromCharCode(evt.charCode);
        switch(character) {
          case ']':
            selected.figure.enlarge();
            break;
          case '[':
            selected.figure.reduce();
            break;
        }
      }
    }
  }

  function oldmousemove(evt) {
    tile = getTileByPixel(evt.pageX, evt.pageY);
    if (tile != cursor.tile) {
      cursor.tile = tile;
      if (shouldDrawCursor()) {
        draw();
      }
    }
  }

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
    this.tile0 = getTileByPosition(json.x0, json.y0);
    this.tile1 = getTileByPosition(json.x1, json.y1);
    this.id = json.id;

    this.save = function() {}

    this.draw = function() {
      context.save();
      context.beginPath();
      context.moveTo(this.tile0.x * tile_size, this.tile0.y * tile_size);
      context.lineTo(this.tile1.x * tile_size, this.tile1.y * tile_size);
      context.lineWidth = tile_size / 4;
      context.lineCap = 'butt';
      context.stroke();
      context.restore();
    }
  }

  function Figure(json) {
    this.size = json.size;
    this.character = json.character;
    this.tile = getTileByPosition(json.position_x, json.position_y);
    this.id = json.id;

    this.save = function() {
      var data = {
        'figure[character]': this.character,
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
          cursor.size = figure.getScale();
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
          cursor.size = figure.getScale();
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

    this.moveToTile = function(target) {
      this.tile = target;
      this.save();
    }

    this.inTile = function(target) {
      var scale = this.getScale();
      return target.x >= this.tile.x && target.x < this.tile.x + scale &&
        target.y >= this.tile.y && target.y < this.tile.y + scale;
    }

    this.draw = function() {
      context.save();
      var offset = {
        x: this.tile.x * tile_size,
        y: this.tile.y * tile_size
      }
      var scaled = this.getScale() * tile_size;
      context.fillStyle = 'rgba(100, 100, 100, 0.3)';
      context.fillRect(offset.x, offset.y, scaled, scaled);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '' + scaled + 'px courier';
      var center = {
        x: scaled / 2 + offset.x,
        y: scaled / 2 + offset.y
      }
      if (this == selected.figure) {
        context.fillStyle = 'rgba(0, 0, 255, 1)'
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowBlur = 1;
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
      } else {
        context.fillStyle = 'rgba(0, 0, 0, 1)';
      }
      context.fillText(this.character, center.x, center.y);
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
