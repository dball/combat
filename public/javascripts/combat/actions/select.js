Combat.actions.register({
  trigger: { mouse: 'click' },
  title: 'select',
  begin: function(evt) { Combat.actions.active.click(evt); },
  end: function() {
    this.index = null;
    this.things.clear();
    this.tiles.start = null;
    this.tiles.current = null;
    Combat.draw();
  },
  things: {
    all: [],
    next: function() {
      var length = this.all.length;
      if (length == 0) {
        this.index = null;
      } else if (this.index == null) {
        this.index = 0;
      } else if (this.index < length - 1) {
        this.index += 1;
      } else {
        this.index = null;
      }
      if (this.current) { this.current.selected = false; }
      this.current = (this.index != null ? this.all[this.index] : null);
      if (this.current) { this.current.selected = true; }
      return this.current;
    },
    clear: function() {
      this.all = [];
      this.index = null;
      if (this.current) { this.current.selected = false; }
      this.current = null;
    }
  },
  tiles: { start: null, current: null },
  click: function(evt) {
    this.tiles.current = Combat.map.getTileByPixel(evt.pageX, evt.pageY);
    if (this.tiles.start == null) {
      this.tiles.start = this.tiles.current;
      var that = this;
      // TODO on function needs to return some sort of offset if we are to handle moving large objects well
      this.things.all = $.grep(Combat.things(), function(thing) { return thing.on(that.tiles.current); });
      this.things.next();
    } else if (this.tiles.start == this.tiles.current) {
      this.things.next();
    } else {
      this.things.current.move(this.tiles.current);
      this.things.clear();
    }
    if (!this.things.current) { Combat.actions.stop(this); }
    Combat.draw();
  },
  mousemove: function(evt) {
    this.tiles.current = Combat.map.getTileByPixel(evt.pageX, evt.pageY);
    if (this.things.current != null) { Combat.draw(); }
  },
  keypress: function(evt) {
    var thing = this.things.current;
    if (thing != null) {
      if (evt.keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
        thing.destroy();
        Combat.actions.stop(this);
        return;
      // TODO This is obviously figure-specific behavior which should get extracted out to a sub-action? ho ho ho.
      } else if (evt.charCode != 0) {
        var key = String.fromCharCode(evt.charCode);
        switch(key) {
          case ']':
            thing.enlarge();
            Combat.draw();
            return;
          case '[':
            thing.reduce();
            Combat.draw();
            return;
        }
      }
    }
    Combat.actions.stop(this);
    keypress(evt);
  },
  draw: function(context) {
    var thing = this.things.current;
    if (thing && thing.drawCursor) { thing.drawCursor(context, this.tiles.current); }
  }
});
