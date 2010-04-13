// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
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
  var selectedFigure;

  function getFigure(id) {
    for (var i=0; i < json.figures.length; i++) {
      var figure = json.figures[i];
      if (figure.id == id) {
        return figure;
      }
    }
  }

  function getTile(x, y) {
    tile_x = Math.floor(x / tile_size);
    tile_y = Math.floor(y / tile_size);
    var key = '' + tile_x + ',' + tile_y;
    var tile = tiles[key];
    if (tile == null) {
      tile = new Object();
      tile.x = tile_x;
      tile.y = tile_y;
      tiles[key] = tile;
    }
    return tile;
  }

  function toggleHighlightTile(tile) {
    if (tile.highlighted) {
      tile.highlighted = false;
    } else {
      tile.highlighted = true;
    }
    draw();
  }

  function drawHighlightedTiles() {
    context.fillStyle = 'rgba(255, 0, 0, 0.25)';
    for (var coordinates in tiles) {
      var tile = tiles[coordinates];
      if (tile.highlighted) {
        var x = 1 + tile.x * tile_size;
        var y = 1 + tile.y * tile_size;
        var w = tile_size - 1;
        var h = tile_size - 1;
        context.fillRect(x, y, w, h);
      }
    }
  }

  function drawFigures() {
    context.save();
    context.font = '' + tile_size + 'px courier';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (var i=0; i < json.figures.length; i++) {
      context.save();
      var figure = json.figures[i];
      var center_x = tile_size / 2 + figure.position_x * tile_size;
      var center_y = tile_size / 2 + figure.position_y * tile_size;
      if (figure == selectedFigure) {
        context.fillStyle = 'rgba(0, 0, 255, 1)'
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.shadowBlur = 2;
        context.shadowColor = 'rgba(0, 0, 175, 0.5)';
      } else {
        context.fillStyle = 'rgba(0, 0, 0, 1)';
      }
      context.fillText(figure.character, center_x, center_y);
      context.restore();
      
      context.save();
      // 5' reach
      context.beginPath();
      context.arc(center_x, center_y, tile_size * 1.5, 0, Math.PI*2, true);
      context.stroke();

      // 10' reach
      context.beginPath();
      context.arc(center_x, center_y, tile_size * 2.5, 0, Math.PI*2, true);
      context.stroke();
      context.restore();
    }
    context.restore();
  }

  function drawGrid() {
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
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawHighlightedTiles();
    drawFigures();
  }

  function click(evt) {
    //toggleHighlightTile(getTile(evt.pageX, evt.pageY));
    tile = getTile(evt.pageX, evt.pageY);
    for (var i=0; i<json.figures.length; i++) {
      var figure = json.figures[i];
      if (figure.position_x == tile.x && figure.position_y == tile.y) {
        if (figure == selectedFigure) {
          selectedFigure = null;
        } else {
          selectedFigure = figure;
        }
        draw();
        return;
      }
    }
    if (selectedFigure != null) {
      selectedFigure = null;
      draw();
    }
  }

  function init() {
    draw();
    $(selector).click(click);
  }

  return {
    init: init
  }
}
