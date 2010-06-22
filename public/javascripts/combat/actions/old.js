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

