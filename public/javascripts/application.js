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
  var selectedFigure;

  function getTile(x, y) {
    var tp = {
      x: Math.floor(x / tile_size),
      y: Math.floor(y / tile_size)
    }
    var key = '' + tp.x + ',' + tp.y;
    var tile = tiles[key];
    return (tile != null ? tile : tiles[key] = tp)
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
    context.save();
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
    context.restore();
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
    drawHighlightedTiles();
    for (var id in figures) {
      figures[id].draw();
    }
  }

  function click(evt) {
    //toggleHighlightTile(getTile(evt.pageX, evt.pageY));
    tile = getTile(evt.pageX, evt.pageY);
    for (var id in figures) {
      var figure = figures[id];
      if (figure.x == tile.x && figure.y == tile.y) {
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

  function Figure(json) {
    var json = json;

    function getScale() {
      switch(json.size) {
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

    function draw() {
      context.save();
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      var scaled = getScale() * tile_size;
      context.font = '' + scaled + 'px courier';
      var offset = {
        x: json.position_x * tile_size,
        y: json.position_y * tile_size
      }
      var center = {
        x: scaled / 2 + offset.x,
        y: scaled / 2 + offset.y
      }
      if (this == selectedFigure) {
        context.fillStyle = 'rgba(0, 0, 255, 1)'
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowBlur = 1;
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
      } else {
        context.fillStyle = 'rgba(0, 0, 0, 1)';
      }
      context.fillText(json.character, center.x, center.y);

      context.fillStyle = 'rgba(100, 100, 100, 0.3)';
      context.fillRect(offset.x, offset.y, scaled, scaled);
      context.restore();

      //context.save();
      // 5' reach
      //context.beginPath();
      //context.arc(center_x, center_y, tile_size * 1.5, 0, Math.PI*2, true);
      //context.stroke();
      // 10' reach
      //context.beginPath();
      //context.arc(center_x, center_y, tile_size * 2.5, 0, Math.PI*2, true);
      //context.stroke();
      //context.restore();
    }

    return {
      x: json.position_x,
      y: json.position_y,
      id: json.id,
      draw: draw
    }
  }

  return {
    init: init
  }
}
