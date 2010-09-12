Combat.actions.register({
  trigger: {
    key: 'c',
    control: 'create figure'
  },
  title: 'create figure',
  size: 'M',
  begin: function(evt) {
    if (this.control) {
      this.control.addClass('active');
      this.letter = this.control.find('input').val();
      this.kind = this.control.find('select').val();
    } else {
      this.kind = 'actor';
    }
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
        Combat.actions.start(action, evt);
      } else if (Combat.actions.active == action) {
        Combat.actions.stop(action);
      }
    });
    control.find('input').change(function(evt) {
      action.letter = $(this).val();
      action.setKind();
    });
  },
  mousewheel: function(evt, delta) {
    var sizes = Combat.figures.sizes;
    if (delta < 0) { this.size = sizes.larger(this.size); } else { this.size = sizes.smaller(this.size); }
    Combat.draw();
  },
  keypress: function(evt) {
    ch = String.fromCharCode(evt.charCode);
    var sizes = Combat.figures.sizes;
    if (ch == ']') {
      this.size = sizes.larger(this.size);
      Combat.draw();
      return;
    } else if (ch == '[') {
      this.size = sizes.smaller(this.size);
      Combat.draw();
      return;
    }
    this.letter = ch;
    if (this.control) {
      this.control.find('input').val(this.letter);
    }
    this.setKind();
    Combat.draw();
  },
  click: function(evt) {
    var tile = Combat.map.point(evt).tile;
    var figure = new Combat.figures.create({
      position_x: tile.x,
      position_y: tile.y,
      letter: this.letter,
      size: this.size,
      kind: this.control.find('select').val()
    });
    Combat.draw();
  },
  mousemove: function(evt) {
    if (this.letter) {
      this.point = Combat.map.point(evt);
      Combat.draw();
    }
  },
  setKind: function(letter) {
    if (this.letter.match(/[A-Z]/)) {
      this.kind = 'actor';
    } else if (this.letter.match(/[a-z]/)) {
      this.kind = 'extra';
    } else if (this.letter.match(/\s/)) {
      this.kind = 'set';
    } else {
      this.kind = 'prop';
    }
    if (this.control) {
      this.control.find('select').val(this.kind);
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
