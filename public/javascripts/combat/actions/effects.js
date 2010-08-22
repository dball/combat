Combat.actions.register({
  trigger: {
    key: 'e',
    control: 'spell effect'
  },
  title: 'spell effect',
  shape: 'circle',
  size: 4,
  begin: function(evt) {
    if (this.control) {
      this.control.addClass('active');
      this.size = parseInt(this.control.find('input').val(), 10) / 5;
    }
    Combat.draw();
  },
  end: function(evt) {
    this.point = null;
    if (this.control) {
      this.control.removeClass('active');
      this.control.find('input').val(this.size * 5);
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
  },
  mousewheel: function(evt, delta) {
    var sizes = Combat.effects.sizes;
    if (delta < 0) { this.size = sizes.larger(this.size); } else { this.size = sizes.smaller(this.size); }
    if (this.control) {
      this.control.find('input').val(this.size * 5);
    }
    Combat.draw();
  },
  keypress: function(evt) {
    ch = String.fromCharCode(evt.charCode);
    var sizes = Combat.effects.sizes;
    if (ch == ']') {
      this.size = sizes.larger(this.size);
    } else if (ch == '[') {
      this.size = sizes.smaller(this.size);
    }
    if (this.control) {
      this.control.find('input').val(this.size * 5);
    }
    Combat.draw();
  },
  click: function(evt) {
    var tile = Combat.map.point(evt).tile;
    var effect = new Combat.effects.create({ x: tile.x, y: tile.y, shape: this.shape, size: this.size });
    Combat.draw();
    Combat.actions.stop();
  },
  mousemove: function(evt) {
    this.point = Combat.map.point(evt);
    Combat.draw();
  },
  draw: function(context) {
    if (!this.point) { return; }
    var tile = this.point.tile;
    var effect = new Combat.effects.build({ x: tile.x, y: tile.y, shape: this.shape, size: this.size });
    context.save();
    context.globalAlpha = 0.5;
    effect.draw(context);
    context.restore();
  }
});
