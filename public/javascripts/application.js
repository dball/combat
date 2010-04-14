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
  var figures = new Object();
  for (var i=0; i < json.figures.length; i++) {
    var figure = new Figure(json.figures[i]);
    figures[figure.id] = figure;
  }
  var selected = {
    figure: null,
    tile: null
  }
  var cursor = {
    tile: null,
    size: 1
  }

  function getTileByPixel(x, y) {
    return getTileByPosition(Math.floor(x / tile_size), Math.floor(y / tile_size));
  }

  function getTileByPosition(x, y) {
    var key = '' + x + ',' + y;
    var tile = tiles[key];
    return (tile != null) ? tile : tiles[key] = new Tile(x, y);
  }

  function drawCursor() {
    if (cursor.tile != null && selected.figure != null) {
      context.save();
      context.fillStyle = 'rgba(255, 0, 0, 0.25)';
      var x = 1 + cursor.tile.x * tile_size;
      var y = 1 + cursor.tile.y * tile_size;
      var w = (tile_size - 1) * cursor.size;
      var h = (tile_size - 1) * cursor.size;
      context.fillRect(x, y, w, h);
      context.restore();
    }
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
    drawCursor();
    for (var id in figures) {
      figures[id].draw();
    }
  }

  /* Event handlers */

  function click(evt) {
    tile = selected.tile = getTileByPixel(evt.pageX, evt.pageY);
    // release selected figure
    if (selected.figure) {
      selected.figure.moveToTile(tile);
      selected.figure = null;
      cursor.size = 1;
      draw();
      return;
    }
    // select a figure
    var figures = tile.getFigures();
    for (var i=0, l = figures.length; i < l; i++) {
      var figure = figures[i];
      if (figure == selected.figure) {
        selected.figure = null;
        cursor.size = 1;
      } else {
        selected.figure = figure;
        cursor.size = figure.getScale();
      }
      draw();
      return;
    }
    if (selected.figure != null) {
      selected.figure = null;
      draw();
    }
  }

  function mousemove(evt) {
    tile = getTileByPixel(evt.pageX, evt.pageY);
    if (tile != cursor.tile) {
      cursor.tile = tile;
      draw();
    }
  }

  /* Child models */

  function Tile(x, y) {
    this.x = x;
    this.y = y;

    this.getFigures = function() {
      var results = [];
      for (var id in figures) {
        var figure = figures[id];
        if (figure.inTile(this)) {
          results.push(figure);
        }
      }
      if (results.length > 1) {
      }
      return results;
    }
  }

  function Figure(json) {
    this.size = json.size;
    this.character = json.character;
    this.tile = getTileByPosition(json.position_x, json.position_y);
    this.id = json.id;

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
  }

  return {
    init: init
  }
}
