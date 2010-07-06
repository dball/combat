Combat.actions.register({
  trigger: 'c',
  title: 'create figure',
  size: 'M',
  begin: function(evt) {},
  end: function(evt) {
    this.point = null;
    Combat.draw();
  },
  keypress: function(evt) {
    ch = String.fromCharCode(evt.charCode);
    if (ch == ']') {
      this.size = Combat.figures.sizes.larger(this.size);
    } else if (ch == '[') {
      this.size = Combat.figures.sizes.smaller(this.size);
    } else {
      this.letter = ch;
    }
    Combat.draw();
  },
  click: function(evt) {
    var tile = Combat.map.point(evt).tile;
    var figure = new Combat.figures.create({
      position_x: tile.x,
      position_y: tile.y,
      letter: this.letter,
      size: this.size
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
    if (!(this.letter && this.point)) { return; }
    var tile = this.point.tile;
    var figure = new Combat.figures.build({ position_x: tile.x, position_y: tile.y, size: this.size, letter: this.letter });
    context.save();
    context.globalAlpha = 0.5;
    figure.draw(context);
    context.restore();
  }
});
