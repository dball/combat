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
  var selected_figure;
  var hover_tile;

  function getTileByPixel(x, y) {
    return getTileByPosition(Math.floor(x / tile_size), Math.floor(y / tile_size));
  }

  function getTileByPosition(x, y) {
    var key = '' + x + ',' + y;
    var tile = tiles[key];
    if (tile != null) {
      return tile;
    } else {
      return tiles[key] = {
        x: x,
        y: y
      }
    }
  }

  function drawHoverTile() {
    if (hover_tile != null) {
      context.save();
      context.fillStyle = 'rgba(255, 0, 0, 0.25)';
      var x = 1 + hover_tile.x * tile_size;
      var y = 1 + hover_tile.y * tile_size;
      var w = tile_size - 1;
      var h = tile_size - 1;
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
    drawHoverTile();
    for (var id in figures) {
      figures[id].draw();
    }
  }

  /* Event handlers */

  function click(evt) {
    tile = getTileByPixel(evt.pageX, evt.pageY);
    if (selected_figure) {
      selected_figure.moveToTile(tile);
      selected_figure = null;
      draw();
      return;
    }
    for (var id in figures) {
      var figure = figures[id];
      if (figure.inTile(tile)) {
        if (figure == selected_figure) {
          selected_figure = null;
        } else {
          selected_figure = figure;
        }
        draw();
        return;
      }
    }
    if (selected_figure != null) {
      selected_figure = null;
      draw();
    }
  }

  function mousemove(evt) {
    tile = getTileByPixel(evt.pageX, evt.pageY);
    if (tile != hover_tile) {
      hover_tile = tile;
      draw();
    }
  }

  /* Child models */

  function Figure(json) {
    var size = json.size;
    var character = json.character;
    var tile = getTileByPosition(json.position_x, json.position_y);
    var id = json.id;

    function getScale() {
      switch(size) {
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

    function moveToTile(target) {
      tile = target;
    }

    function inTile(target) {
      var scale = getScale();
      return target.x >= tile.x && target.x < tile.x + scale &&
        target.y >= tile.y && target.y < tile.y + scale;
    }

    function draw() {
      context.save();
      var offset = {
        x: tile.x * tile_size,
        y: tile.y * tile_size
      }
      var scaled = getScale() * tile_size;
      context.fillStyle = 'rgba(100, 100, 100, 0.3)';
      context.fillRect(offset.x, offset.y, scaled, scaled);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '' + scaled + 'px courier';
      var center = {
        x: scaled / 2 + offset.x,
        y: scaled / 2 + offset.y
      }
      if (this == selected_figure) {
        context.fillStyle = 'rgba(0, 0, 255, 1)'
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowBlur = 1;
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
      } else {
        context.fillStyle = 'rgba(0, 0, 0, 1)';
      }
      context.fillText(character, center.x, center.y);
      context.restore();
    }

    return {
      id: id,
      draw: draw,
      inTile: inTile,
      moveToTile: moveToTile
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
