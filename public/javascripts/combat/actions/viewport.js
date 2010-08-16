Combat.actions.register({
  trigger: { key: ']' },
  title: 'zoom in',
  begin: function(evt) {
    Combat.map.viewport.zoom('+');
    Combat.actions.stop(this);
  }
});

Combat.actions.register({
  trigger: { key: '[' },
  title: 'zoom out',
  begin: function(evt) {
    Combat.map.viewport.zoom('-');
    Combat.actions.stop(this);
  }
});

Combat.actions.register({
  trigger: { key: '=' },
  title: 'reset viewport',
  begin: function(evt) {
    Combat.map.viewport.reset();
    Combat.actions.stop(this);
  }
});

Combat.actions.register({
  trigger: { key: KeyEvent.DOM_VK_LEFT },
  begin: function(evt) {
    Combat.map.viewport.pan('-', 'x');
    Combat.actions.stop(this);
  }
});
Combat.actions.register({
  trigger: { key: KeyEvent.DOM_VK_RIGHT },
  begin: function(evt) {
    Combat.map.viewport.pan('+', 'x');
    Combat.actions.stop(this);
  }
});
Combat.actions.register({
  trigger: { key: KeyEvent.DOM_VK_UP },
  begin: function(evt) {
    Combat.map.viewport.pan('-', 'y');
    Combat.actions.stop(this);
  }
});
Combat.actions.register({
  trigger: { key: KeyEvent.DOM_VK_DOWN },
  begin: function(evt) {
    Combat.map.viewport.pan('+', 'y');
    Combat.actions.stop(this);
  }
});
