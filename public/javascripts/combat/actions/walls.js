Combat.actions.register({
  trigger: 'd',
  title: 'draw wall',
  begin: function(evt) {
    this.vertices = [Combat.map.point(evt).tile];
  },
  end: function(evt) {
    if (this.vertices.length > 1) { Combat.walls.create({ vertices: this.vertices }); }
    this.vertices = null;
    Combat.draw();
  },
  click: function(evt) {
    this.vertices.push(Combat.map.point(evt).tile);
    Combat.draw();
  },
  mousemove: function(evt) {
    this.point = Combat.map.point(evt);
    Combat.draw();
  },
  draw: function(context) {
    this.vertices.push(this.point.tile);
    var wall = new Combat.walls.build({ vertices: this.vertices });
    context.save();
    context.globalAlpha = 0.5;
    wall.draw(context);
    context.restore();
    this.vertices.pop();
  }
});
