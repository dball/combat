Combat.actions.register({
  trigger: ']',
  title: 'zoom in',
  begin: function(evt) {
    Combat.map.viewport.zoom('+');
    Combat.actions.stop(this);
  }
});

Combat.actions.register({
  trigger: '[',
  title: 'zoom out',
  begin: function(evt) {
    Combat.map.viewport.zoom('-');
    Combat.actions.stop(this);
  }
});

Combat.actions.register({
  trigger: '=',
  title: 'reset viewport',
  begin: function(evt) {
    Combat.map.viewport.reset();
    Combat.actions.stop(this);
  }
});
