var Combat = {
  url: window.location.href,

  init: function(json, id, viewport_id, controls_id) {
    this.map.init(json.map, id, viewport_id);
    this.figures.init(json.map.figures);
    this.pictures.init(json.map.images);
    this.walls.init(json.map.walls);
    this.map.viewport.reset();
    this.actions.bind($('#' + id), $('#' + controls_id));
  },

  draw: function() {
    this.map.draw(this.pictures, this.walls, this.figures, this.actions);
  },

  things: function() {
    return this.figures.all.concat(this.pictures.all, this.walls.all);
  }
}
