// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
var Map = function(json_arg) {
  var json = json_arg;
  var tiles = new Object();
  var canvas = document.getElementById('map');
  var context = canvas.getContext('2d');
  var tile_size = Math.min(
    canvas.width / json.width,
    canvas.height / json.height
  );

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
    var x = 1 + tile.x * tile_size;
    var y = 1 + tile.y * tile_size;
    var w = tile_size - 1;
    var h = tile_size - 1;
    if (tile.highlighted) {
      context.clearRect(x, y, w, h);
      tile.highlighted = false;
    } else {
      context.fillStyle = 'rgba(255, 0, 0, 0.25)';
      context.fillRect(x, y, w, h);
      tile.highlighted = true;
    }
  }

  function drawFigures() {
    context.font = '' + tile_size + 'px courier';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (var i=0; i < json.figures.length; i++) {
      var figure = json.figures[i];
      var center_x = tile_size / 2 + figure.position_x * tile_size;
      var center_y = tile_size / 2 + figure.position_y * tile_size;
      context.fillText(figure.character, center_x, center_y);
      
      // 5' reach
      context.beginPath();
      context.arc(center_x, center_y, tile_size, 0, Math.PI*2, true);
      context.stroke();

      // 10' reach
      context.beginPath();
      context.arc(center_x, center_y, tile_size * 2, 0, Math.PI*2, true);
      context.stroke();
    }
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

  return {
    draw: function() {
      context.save();
      drawGrid();
      drawFigures();
      $('#map').click(function(evt) {
        var tile = getTile(evt.pageX, evt.pageY);
        toggleHighlightTile(tile);
      });
      context.restore();
    }
  }
}
