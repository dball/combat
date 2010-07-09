var Combat = {
  url: window.location.href,

  init: function(json, id, viewport_id) {
    this.map.init(json, id, viewport_id);
    this.figures.init(json.figures);
    this.pictures.init(json.images);
    this.walls.init(json.walls);
    this.map.viewport.reset();
    this.actions.bind($('#' + id));
  },

  draw: function() {
    this.map.draw(this.pictures, this.walls, this.figures, this.actions);
  },

  things: function() {
    return this.figures.all.concat(this.pictures.all, this.walls.all);
  }
}
