Combat.actions.register({
  trigger: {
    key: 'd',
    control: 'draw wall'
  },
  title: 'draw wall',
  begin: function(evt) {
    if (this.control) {
      this.control.addClass('active');
      this.kind = this.control.find('select').val();
    } else {
      this.kind = 'wall';
    }
    this.vertices = [];
    this.point = null;
  },
  end: function(evt) {
    if (this.control) { this.control.removeClass('active'); this.control.find('select').attr('disabled', false); }
    if (this.vertices.length > 1) { Combat.walls.create({ vertices: this.vertices, kind: this.kind }); }
    this.point = null;
    this.kind = null;
    this.vertices = null;
    Combat.draw();
  },
  bind: function(control) {
    this.control = control;
    var action = this;
    control.find('button').click(function(evt) {
      if (Combat.actions.active == null) {
        Combat.actions.start(action, evt);
      } else {
        Combat.actions.stop(action);
      }
    });
    control.find('select').change(function(evt) {
      action.kind = $(this).val();
    });
  },
  mousedown: function(evt) {
    if (this.kind == 'drawing') {
      this.drawing = true;
      Combat.draw();
    }
  },
  mouseup: function(evt) {
    if (this.kind == 'drawing') {
      evt.preventDefault();
      action = Combat.actions.active;
      action.drawing = false;
      Combat.actions.stop();
      Combat.draw();
    }
  },
  click: function(evt) {
    if (this.kind == 'wall') {
      this.vertices.push(this.point.tile);
      if (this.control) { this.control.find('select').attr('disabled', true); }
      Combat.draw();
    }
  },
  mousemove: function(evt) {
    this.point = Combat.map.point(evt);
    if (this.kind == 'drawing' && this.drawing) {
      this.vertices.push(this.point);
    }
    Combat.draw();
  },
  draw: function(context) {
    var wall = new Combat.walls.build({ vertices: this.vertices, kind: this.kind });
    if (this.kind == 'wall') {
      if (this.point) { this.vertices.push(this.point.tile); }
      context.save();
      context.globalAlpha = 0.5;
      wall.draw(context);
      context.restore();
      if (this.point) { this.vertices.pop(); }
    } else {
      wall.draw(context);
    }
  }
});
