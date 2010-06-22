Combat.actions.register({
  trigger: ']',
  title: 'zoom in',
  begin: function(evt) {
    console.log("begin zoom in", this, Combat);
    Combat.map.viewport.zoom('+');
    this.end();
  }
});

Combat.actions.register({
  trigger: '[',
  title: 'zoom out',
  begin: function(evt) {
    Combat.map.viewport.zoom('-');
    this.end();
  }
});

Combat.actions.register({
  trigger: '=',
  title: 'reset viewport',
  begin: function(evt) {
    Combat.map.viewport.reset();
    this.end();
  }
});
