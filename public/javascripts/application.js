var Map = function(json, id, viewport_id) {
  var canvas = document.getElementById(id);
  /*
  $(canvas).width($('#' + viewport_id).width());
  $(canvas).height($('#' + viewport_id).height());
  */
  var url = window.location.href;
  var context = canvas.getContext('2d');
  var tiles = {}
  var figures = $.map(json.figures, function(figure) { return new Figure(figure); });
  var walls = $.map(json.walls, function(wall) { return new Wall(wall); });
  var pictures = $.map(json.images, function(image) { return new Picture(image); });

  var viewport = {
    load: function(results) {
      viewport.left = results.left;
      viewport.top = results.top;
      viewport.width = results.width;
      viewport.height = results.height;
      viewport.scale = results.scale;
      viewport.setContext();
      draw();
    },
    reset: function() {
      var viewport = this;
      $.ajax({
        type: 'POST',
        url: url + "/reset",
        data: { aspect: canvas.width * 1.0 / canvas.height },
        success: function(results) { viewport.load(results); }
      });
    },
    zoom: function(direction) {
      $.ajax({
        type: 'POST',
        url: window.location.href + "/zoom",
        data: { direction: direction },
        success: function(results) { viewport.load(results); }
      });
    },
    pan: function(direction, axis) {
      var viewport = this;
      $.ajax({
        type: 'POST',
        url: url + "/pan",
        data: { direction: direction, axis: axis },
        success: function(results) { viewport.load(results); }
      });
    },
    setContext: function() {
      tiles.size = (canvas.width * 1.0 / viewport.width) * this.scale;
      context.setTransform(tiles.size, 0, 0, tiles.size, 0, 0);
      context.translate(-this.left, -this.top);
    },
    getTileByPixel: function(x, y) {}
  }
  viewport.reset();

  var actions = {
    selected: null,
    ']': {
      title: 'zoom in',
      init: function(evt) {
        actions.selected = null;
        viewport.zoom('+');
      }
    },
    '[': {
      title: 'zoom out',
      init: function(evt) {
        actions.selected = null;
        viewport.zoom('-');
      }
    },
    i: {
      title: 'select Image',
      index: null,
      getPicture: function() {
        if (this.index != null) {
          return pictures[this.index];
        }
      },
      init: function(evt) {
        if (pictures.length > 0) {
          this.index = 0;
          this.getPicture().selected = true;
          draw();
        }
      },
      mousemove: function(evt) {},
      draw: function() {},
      keypress: function(evt) {},
      click: function(evt) {},
      cancel: function() {
        this.getPicture().selected = false;
        this.index = null;
        draw();
      }
    },
    c: {
      title: 'Create figure',
      letter: 'm',
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
          var scale = figure.getScale();
          context.fillRect(0, 0, scale, scale);
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
      viewport.pan('-', 'x');
    }
  }
  actions[KeyEvent.DOM_VK_RIGHT] = {
    init: function(evt) {
      actions.selected = null;
      viewport.pan('+', 'x');
    }
  }
  actions[KeyEvent.DOM_VK_UP] = {
    init: function(evt) {
      actions.selected = null;
      viewport.pan('-', 'y');
    }
  }
  actions[KeyEvent.DOM_VK_DOWN] = {
    init: function(evt) {
      actions.selected = null;
      viewport.pan('+', 'y');
    }
  }
  actions['='] = {
    title: 'reset viewport',
    init: function(evt) {
      actions.selected = null;
      viewport.reset();
    }
  }

  function getTileByPixel(x, y) {
    var position = $(canvas).position();
    return getTileByPosition(
      Math.floor(viewport.left + (x - position.left) / tiles.size),
      Math.floor(viewport.top + (y - position.top) / tiles.size)
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
    // FIXME we're drawing at tile centers, not tile edges...? Maybe?
    // FIXME truncate
    for (var i=Math.ceil(viewport.left), right = Math.floor(viewport.left + viewport.width); i <= right; i++) {
      context.moveTo(i, viewport.top);
      context.lineTo(i, viewport.top + viewport.height);
    }
    for (var i=Math.ceil(viewport.top), bottom = Math.floor(viewport.top + viewport.height); i <= bottom; i++) {
      context.moveTo(viewport.left, i);
      context.lineTo(viewport.left + viewport.width, i);
    }
    context.lineWidth = 0.02;
    context.strokeStyle = 'rgba(100, 100, 100, 1)';
    context.stroke();
    context.restore();
  }

  function draw() {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    $.each(pictures, function(i, picture) { picture.draw(); });
    drawGrid();
    $.each(walls, function(i, wall) { wall.draw(); });
    $.each(figures, function(i, figure) { figure.draw(); });
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
    if (actions.selected != null) {
      evt.preventDefault();
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
          evt.preventDefault();
          actions.selected.init(evt);
        }
      } else if (evt.keyCode != 0) {
        if ((actions.selected  = actions[evt.keyCode]) != null) {
          evt.preventDefault();
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
    draw();
    $('#' + id)
      .click(click)
      .mousemove(mousemove);
    $(document).keypress(keypress);
    document.addEventListener("dragover", function(event) {
      event.preventDefault();
    }, true);
    document.addEventListener("drop", function(event) {
      event.preventDefault();
      var dt = event.dataTransfer;
      var files = dt.files;
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();  
        reader.onload = function(event) {
          var xhr = new XMLHttpRequest();  
          xhr.open("POST", window.location.href + "/images", true);  
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          xhr.setRequestHeader("Content-Length", file.fileSize);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.sendAsBinary(this.result);
          xhr.onreadystatechange = function (e) {  
            if (xhr.readyState == 4) {  
              if (xhr.status == 201) {
                var json = $.parseJSON(xhr.responseText);
                json.x = 0;
                json.y = 0;
                json.width = 1;
                json.height = 1;
                pictures.push(new Picture(json));
                draw();
              } else {
                console.log("error", xhr);
              }
            }
          }
        }
        reader.readAsBinaryString(file);  
      }
    }, true);
  }

  return {
    init: init
  }
}
