var Map = function(json, id, viewport_id) {
  var canvas = document.getElementById(id);
  $(canvas).width($('#' + viewport_id).width());
  $(canvas).height($('#' + viewport_id).height());
  var url = window.location.href + "/../..";
  var context = canvas.getContext('2d');
  var scale = json.scale;
  var viewport = {
    x: json.x,
    y: json.y
  }
  var width = 30;
  var height = 20;
  var tiles = {
    size: Math.min(canvas.width / json.map.width, canvas.height / json.map.height) * scale
  }
  context.scale(tiles.size, tiles.size);
  context.translate(-viewport.x, -viewport.y);

  var figures = [];
  $.each(json.map.figures, function(i, figure) { figures.push(new Figure(figure)); });

  var walls = [];
  $.each(json.map.walls, function(i, wall) { walls.push(new Wall(wall)); });
  var actions = {
    selected: null,
    ']': {
      title: 'Zoom in',
      init: function(evt) {
        $.ajax({
          type: 'POST',
          url: window.location.href + "/zoom",
          data: { direction: '+' },
          success: function(results) {
            ratio = results.scale / scale;
            scale = results.scale;
            tiles.size = tiles.size * ratio;
            context.scale(ratio, ratio);
            draw();
          }
        });
        actions.selected = null;
      }
    },
    '[': {
      title: 'Zoom out',
      init: function(evt) {
        $.ajax({
          type: 'POST',
          url: window.location.href + "/zoom",
          data: { direction: '-' },
          success: function(results) {
            ratio = results.scale / scale;
            scale = results.scale;
            tiles.size = tiles.size * ratio;
            context.scale(ratio, ratio);
            draw();
          }
        });
        actions.selected = null;
      }
    },
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
        context.fillRect(this.tile.x, this.tile.y, 1, 1);
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
            figure.destroy();
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
        actions.selected = null;
        draw();
      },
      draw: function() {
        var figure = this.getFigure();
        if (figure != null) {
          context.save();
          context.fillStyle = 'rgba(255, 0, 0, 0.25)';
          var tile = this.tiles.current;
          context.translate(tile.corner.x, tile.corner.y);
          var size = figure.getSize();
          context.fillRect(0, 0, size, size);
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

  actions[KeyEvent.DOM_VK_LEFT] = {
    init: function(evt) {
      actions.selected = null;
      $.ajax({
        type: 'POST',
        url: window.location.href + "/pan",
        data: { direction: '-', axis: 'x' },
        success: function(results) {
          context.translate(viewport.x - results.x, 0);
          viewport.x = results.x;
          draw();
        }
      });
    }
  }
  actions[KeyEvent.DOM_VK_RIGHT] = {
    init: function(evt) {
      actions.selected = null;
      $.ajax({
        type: 'POST',
        url: window.location.href + "/pan",
        data: { direction: '+', axis: 'x' },
        success: function(results) {
          context.translate(viewport.x - results.x, 0);
          viewport.x = results.x;
          draw();
        }
      });
    }
  }
  actions[KeyEvent.DOM_VK_UP] = {
    init: function(evt) {
      actions.selected = null;
      $.ajax({
        type: 'POST',
        url: window.location.href + "/pan",
        data: { direction: '-', axis: 'y' },
        success: function(results) {
          context.translate(0, viewport.y - results.y);
          viewport.y = results.y;
          draw();
        }
      });
    }
  }
  actions[KeyEvent.DOM_VK_DOWN] = {
    init: function(evt) {
      actions.selected = null;
      $.ajax({
        type: 'POST',
        url: window.location.href + "/pan",
        data: { direction: '+', axis: 'y' },
        success: function(results) {
          context.translate(0, viewport.y - results.y);
          viewport.y = results.y;
          draw();
        }
      });
    }
  }
  actions['='] = {
    title: 'reset viewport',
    init: function(evt) {
      actions.selected = null;
      $.ajax({
        type: 'PUT',
        url: window.location.href,
        data: {
          'viewport[x]': 0,
          'viewport[y]': 0,
          'viewport[scale]': 1,
        }
      });
      context.translate(viewport.x, viewport.y);
      context.scale(1 / scale, 1 / scale);
      viewport.x = 0;
      viewport.y = 0;
      scale = 1;
      draw();
    }
  }

  function getTileByPixel(x, y) {
    var position = $(canvas).position();
    return getTileByPosition(
      Math.floor(viewport.x + (x - position.left) / tiles.size),
      Math.floor(viewport.y + (y - position.top) / tiles.size)
    );
  }

  function getIntersectionByPixel(x, y) {
    return getTileByPixel(x + tiles.size / 2, y + tiles.size / 2);
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
    for (var i=0; i < width; i++) {
      context.moveTo(i, 0);
      context.lineTo(i, height);
    }
    for (var i=0; i < height; i++) {
      context.moveTo(0, i);
      context.lineTo(width, i);
    }
    context.lineWidth = 0.025;
    context.strokeStyle = 'rgba(200, 200, 200, 1)';
    context.stroke();
    context.restore();
  }

  function draw() {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    drawGrid();
    $.each(figures, function(i, figure) { figure.draw(); });
    $.each(walls, function(i, wall) { wall.draw(); });
    if (actions.selected != null) {
      actions.selected.draw();
    }
  }

  /* Event handlers */

  function click(evt) {
    if (actions.selected != null) {
      actions.selected.click(evt);
    } else if (actions.click != null) {
      actions.selected = actions.click;
      actions.selected.click(evt);
    }
  }

  function keypress(evt) {
    evt.preventDefault();
    if (actions.selected != null) {
      if (evt.keyCode == KeyEvent.DOM_VK_ESCAPE) {
        action = actions.selected;
        actions.selected = null;
        action.cancel();
      } else {
        actions.selected.keypress(evt);
      }
    } else {
      if (evt.charCode != 0) {
        if ((actions.selected = actions[String.fromCharCode(evt.charCode)]) != null) {
          actions.selected.init(evt);
        }
      } else if (evt.keyCode != 0) {
        if ((actions.selected  = actions[evt.keyCode]) != null) {
          actions.selected.init(evt);
        }
      }
    }
  }

  function mousemove(evt) {
    if (actions.selected != null) {
      actions.selected.mousemove(evt);
    }
  }

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

    this.getSize = function() {
      return this.getScale();
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
      // Firefox and Safari were both having issues with 1px fonts, so we scale by 10 as a workaround
      context.scale(0.1, 0.1);
      var size = this.getSize() * 10;
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
    $('#' + id)
      .click(click)
      .mousemove(mousemove);
    $(document).keypress(keypress);
  }

  return {
    init: init
  }
}
