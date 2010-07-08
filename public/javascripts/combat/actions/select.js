Combat.actions.register({
  trigger: { mouse: 'click' },
  title: 'select',
  begin: function(evt) { Combat.actions.active.click(evt); },
  end: function() {
    this.clear();
    Combat.draw();
  },
  clear: function() {
    this.index = null;
    this.shift = null;
    this.things.clear();
    this.points.start = null;
    this.points.current = null;
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
  points: {
    start: null,
    current: null
  },
  click: function(evt) {
    this.points.current = Combat.map.point(evt);
    if (this.points.start == null) {
      this.shift = evt.shiftKey;
      this.points.start = this.points.current;
      var that = this;
      var all = this.shift ? Combat.pictures.all : Combat.things();
      var contains = $.map(all, function(thing) { return { thing: thing, offset: thing.contains(that.points.current) }; });
      this.things.all = $.grep(contains, function(props) { return props.offset; });
      this.things.next();
    } else if (this.points.start.tile.x == this.points.current.tile.x && this.points.start.tile.y == this.points.current.tile.y) {
      this.things.next();
    } else {
      var thing = this.things.current.thing;
      if (this.shift) {
        thing.resizeTo(this.points.current);
      } else {
        thing.move(this.points.current.minus(this.things.current.offset));
      }
      this.things.clear();
    }
    if (!this.things.current) { Combat.actions.stop(this); }
    Combat.draw();
  },
  mousemove: function(evt) {
    this.points.current = Combat.map.point(evt);
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
    if (current) {
      var thing = current.thing;
      if (this.shift) {
        thing.drawResizeHandle(context, this.points.current);
      } else {
        var point = this.points.current.minus(current.offset);

        if (thing.type == 'figure') {
          context.save();
          context.fillStyle = 'rgba(0, 0, 0, 0.6)';
          var scale = thing.scale();
          var points = Combat.map.points.line(thing.tile, point.tile);
          if (points.length > 2) {
            points.shift();
            points.pop();
            $.each(points, function() { context.fillRect(this.x, this.y, scale, scale); });
          }
          context.restore();
        }

        context.save();
        context.lineWidth = 0.05;
        thing.drawBorder(context);
        context.globalAlpha = 0.5;
        context.translate(point.tile.x - thing.tile.x, point.tile.y - thing.tile.y);
        thing.draw(context);
        thing.drawBorder(context);
        context.restore();
      }
    }
  }
});
