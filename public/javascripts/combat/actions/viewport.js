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
  trigger: { mouse: 'wheel' },
  title: 'zoom',
  begin: function(evt, delta) {
    Combat.map.viewport.zoom(delta > 0 ? '+' : '-');
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
Combat.actions.register({
  trigger: { control: 'map name' },
  bind: function(control) {
    var input = control.find('input');
    input.change(function(evt) {
      $.ajax({ type: 'PUT', url: Combat.url, data: input.serialize(), success: function(json) { input.val(json.map.name); } });
    });
  }
});
Combat.actions.register({
  trigger: { control: 'load map' },
  bind: function(control) {
    control.find('select').change(function(evt) {
      window.location.href = $(this).val();
    });
  }
});
