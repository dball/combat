Combat.actions.register({
  trigger: 'c',
  title: 'create figure',
  begin: function(evt) {},
  end: function(evt) {
    Combat.draw();
  },
  keypress: function(evt) {
    this.letter = String.fromCharCode(evt.charCode);
    Combat.draw();
  },
  click: function(evt) {
    var tile = Combat.map.point(evt).tile;
    var figure = new Combat.figures.create({
      position_x: tile.x,
      position_y: tile.y,
      letter: this.letter,
      size: 'M'
    });
    Combat.draw();
  },
  mousemove: function(evt) {
    if (this.letter) {
      this.point = Combat.map.point(evt);
      Combat.draw();
    }
  },
  draw: function(context) {
    if (!this.letter) { return; }
    var tile = this.point.tile;
    var figure = new Combat.figures.build({ position_x: tile.x, position_y: tile.y, size: 'M', letter: this.letter });
    context.save();
    context.globalAlpha = 0.5;
    figure.draw(context);
    context.restore();
  }
});
