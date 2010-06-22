Combat.actions.register({
  trigger: { mouse: 'click' },
  title: 'select figure',
  begin: function(evt) { Combat.actions.active.click(evt); },
  end: function() {
    this.index = null;
    this.figures = [];
    this.tiles.current = null;
    this.tiles.start = null;
    Combat.draw();
  },
  figures: [],
  tiles: { start: null, current: null },
  getFigure: function() {
    return this.index != null ? this.figures[this.index] : null;
  },
  nextFigure: function() {
    var length = this.figures.length;
    if (length == 0) {
      this.index = null;
    } else if (this.index == null) {
      this.index = 0;
    } else if (this.index < length - 1) {
      this.index += 1;
    } else {
      this.index = null;
    }
  },
  click: function(evt) {
    this.tiles.current = Combat.map.getTileByPixel(evt.pageX, evt.pageY);
    if (this.tiles.start == null) {
      this.tiles.start = this.tiles.current;
      var that = this;
      this.figures = $.grep(Combat.figures.all, function(figure) { return figure.on(that.tiles.start); });
      this.nextFigure();
    } else if (this.tiles.start == this.tiles.current) {
      this.nextFigure();
    } else {
      this.getFigure().move(this.tiles.current);
      this.index = null;
    }
    if (this.getFigure() == null) { Combat.actions.stop(this); }
    Combat.draw();
  },
  mousemove: function(evt) {
    this.tiles.current = Combat.map.getTileByPixel(evt.pageX, evt.pageY);
    if (this.getFigure() != null) { Combat.draw(); }
  },
  keypress: function(evt) {
    var figure = this.getFigure();
    if (figure != null) {
      if (evt.keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
        figure.destroy();
        Combat.actions.stop(this);
        return;
      } else if (evt.charCode != 0) {
        var key = String.fromCharCode(evt.charCode);
        switch(key) {
          case ']':
            figure.enlarge();
            Combat.draw();
            return;
          case '[':
            figure.reduce();
            Combat.draw();
            return;
        }
      }
    }
    Combat.actions.stop(this);
    keypress(evt);
  },
  draw: function(context) {
    var figure = this.getFigure();
    if (!figure) { return; }
    context.save();
    context.fillStyle = 'rgba(255, 0, 0, 0.25)';
    var tile = this.tiles.current;
    context.translate(tile.corner.x, tile.corner.y);
    // FIXME should be figure.drawBackground or something
    var scale = figure.scale();
    context.fillRect(0, 0, scale, scale);
    context.fillStyle = 'rgba(0, 0, 255, 1)'
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowBlur = 1;
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
    figure.drawLetter(context);
    context.restore();
  }
});
