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
      if (this.current) { this.current.thing.selected = false; }
      this.current = (this.index != null ? this.all[this.index] : null);
      if (this.current) { this.current.thing.selected = true; }
      return this.current;
    },
    clear: function() {
      this.all = [];
      this.index = null;
      if (this.current) { this.current.thing.selected = false; }
      this.current = null;
    }
  },
  tiles: {
    start: null, 
    current: null,
    current_with_offset: function(offset) {
      return Combat.map.getTileByPosition(this.current.x - offset.x, this.current.y - offset.y);
    }
  },
  click: function(evt) {
    this.tiles.current = Combat.map.getTileByPixel(evt.pageX, evt.pageY);
    if (this.tiles.start == null) {
      this.tiles.start = this.tiles.current;
      var that = this;
      var all = $.map(Combat.things(), function(thing) { return { thing: thing, offset: thing.on(that.tiles.current) }; });
      this.things.all = $.grep(all, function(props) { return props.offset; });
      this.things.next();
    } else if (this.tiles.start == this.tiles.current) {
      this.things.next();
    } else {
      this.things.current.thing.move(this.tiles.current_with_offset(this.things.current.offset));
      this.things.clear();
    }
    if (!this.things.current) { Combat.actions.stop(this); }
    Combat.draw();
  },
  mousemove: function(evt) {
    this.tiles.current = Combat.map.getTileByPixel(evt.pageX, evt.pageY);
    if (this.things.current) { Combat.draw(); }
  },
  keypress: function(evt) {
    var current = this.things.current;
    if (current != null) {
      if (evt.keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
        current.thing.destroy();
        Combat.actions.stop(this);
        return;
      // TODO This is obviously figure-specific behavior which should get extracted out to a sub-action? ho ho ho.
      } else if (evt.charCode != 0) {
        var key = String.fromCharCode(evt.charCode);
        switch(key) {
          case ']':
            current.thing.enlarge();
            Combat.draw();
            return;
          case '[':
            current.thing.reduce();
            Combat.draw();
            return;
        }
      }
    }
    Combat.actions.stop(this);
    keypress(evt);
  },
  draw: function(context) {
    var current = this.things.current;
    if (current && current.thing.drawCursor) {
      current.thing.drawCursor(context, this.tiles.current_with_offset(current.offset));
    }
  }
});
