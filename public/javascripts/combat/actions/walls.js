Combat.actions.register({
  trigger: { key: 'd' },
  title: 'draw wall',
  begin: function(evt) {
    this.vertices = [];
    this.point = null;
  },
  end: function(evt) {
    this.point = null;
    if (this.vertices.length > 1) { Combat.walls.create({ vertices: this.vertices }); }
    this.vertices = null;
    Combat.draw();
  },
  click: function(evt) {
    this.vertices.push(this.point.tile);
    Combat.draw();
  },
  mousemove: function(evt) {
    this.point = Combat.map.point(evt);
    Combat.draw();
  },
  draw: function(context) {
    if (this.point) { this.vertices.push(this.point.tile); }
    var wall = new Combat.walls.build({ vertices: this.vertices });
    context.save();
    context.globalAlpha = 0.5;
    wall.draw(context);
    context.restore();
    if (this.point) { this.vertices.pop(); }
  }
});
