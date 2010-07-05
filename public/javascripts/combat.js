var Combat = {
  url: window.location.href,

  init: function(json, id, viewport_id) {
    this.map.init(json, id, viewport_id);
    this.figures.init(json.figures);
    this.pictures.init(json.images);
    //var walls = $.map(json.walls, function(wall) { return new Wall(wall); });
    this.map.viewport.reset();
    this.actions.bind($('#' + id));
  },

  draw: function() {
    this.map.draw(this.pictures, this.figures, this.actions);
    //$.each(walls, function(i, wall) { wall.draw(); });
  },

  things: function() {
    return this.figures.all.concat(this.pictures.all);
  }
}
