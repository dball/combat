Combat.actions.register({
  trigger: {
    key: 'c',
    control: 'create figure'
  },
  title: 'create figure',
  size: 'M',
  begin: function(evt) {
    if (this.control) { this.control.addClass('active'); }
    Combat.draw();
  },
  end: function(evt) {
    this.point = null;
    if (this.control) {
      this.control.removeClass('active');
      this.control.find('input').val(this.letter);
    }
    Combat.draw();
  },
  bind: function(control) {
    this.control = control;
    var action = this;
    control.find('button').click(function(evt) {
      if (Combat.actions.active == null) {
        if (!action.letter) { action.letter = control.find('input').val(); }
        Combat.actions.start(action, evt);
      } else if (Combat.actions.active == action) {
        Combat.actions.stop(action);
      }
    });
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
    if (this.control) {
      this.control.find('input').val(this.letter);
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
