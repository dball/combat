Combat.actions.register({
  trigger: {
    mouse: 'click',
    control: 'select'
  },
  title: 'select',
  begin: function(evt) {
    Combat.actions.active.click(evt);
    if (Combat.actions.active) { Combat.actions.active.points.offscreen = false; }
  },
  end: function() {
    this.clear();
    Combat.draw();
  },
  bind: function(control) {
    this.control = control;
    var action = this;
    control.find('button').click(function(evt) {
      if (Combat.actions.active == action) {
        var current = action.things.current;
        if (current !== null) { current.thing.destroy(); }
        Combat.actions.stop(action);
      }
    });
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
      if (length === 0) {
        this.index = null;
      } else if (this.index === null) {
        this.index = 0;
      } else if (this.index < length - 1) {
        this.index += 1;
      } else {
        this.index = null;
      }
      if (this.current) { this.current.thing.selected = false; }
      this.current = (this.index !== null ? this.all[this.index] : null);
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
    offscreen: false,
    start: null,
    current: null
  },
  click: function(evt) {
    this.points.current = Combat.map.point(evt);
    if (this.points.start === null) {
      this.shift = evt.shiftKey;
      this.points.start = this.points.current;
      var that = this;
      var all = this.shift ? Combat.pictures.all : Combat.things();
      var contains = $.map(all, function(thing) { return { thing: thing, offset: thing.contains(that.points.current, evt) }; });
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
  mouseleave: function(evt) {
    this.points.offscreen = true;
    if (this.things.current) { Combat.draw(); }
  },
  mouseenter: function(evt) {
    this.points.offscreen = false;
    if (this.things.current) { Combat.draw(); }
  },
  mousewheel: function(evt, delta) {
    var current = this.things.current;
    if (current && current.thing.enlarge) {
      if (delta < 0) { current.thing.enlarge(); } else { current.thing.reduce(); }
      Combat.draw();
    }
  },
  keypress: function(evt) {
    var current = this.things.current;
    if (current !== null) {
      if (evt.keyCode == KeyEvent.DOM_VK_BACK_SPACE) {
        evt.preventDefault();
        current.thing.destroy();
        Combat.actions.stop(this);
        return;
      // TODO This is obviously figure-specific behavior which should get extracted out to a sub-action? ho ho ho.
      } else if (evt.charCode !== 0) {
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
          case ' ':
            if (current.thing.copy) {
              var copy = current.thing.copy();
              copy.move(this.points.current.minus(this.things.current.offset));
              Combat.draw();
            }
            return;
        }
      }
    }
    Combat.actions.stop(this);
  },
  draw: function(context) {
    var current = this.things.current;
    if (current) {
      var thing = current.thing;
      if (this.shift) {
        thing.drawResizeHandle(context, this.points.current);
      } else {
        var point = this.points.current.minus(current.offset);

        if (thing.type == 'figure' && !this.points.offscreen) {
          context.save();
          context.fillStyle = 'rgba(10, 10, 10, 0.5)';
          var scale = thing.scale();
          var points = Combat.map.points.line(thing.tile, point.tile);
          var distance = Combat.map.distance(points);
          if (points.length > 2) {
            points.shift();
            points.pop();
            _(points).each(function(point) { context.fillRect(point.x, point.y, scale, scale); });
          }
          context.restore();

          Combat.map.drawTooltip(context, this.points.current, '' + distance + ' ft');
        }

        context.save();
        context.lineWidth = 0.05;
        thing.drawBorder(context);
        if (!this.points.offscreen) {
          context.globalAlpha = 0.5;
          context.translate(point.tile.x - thing.tile.x, point.tile.y - thing.tile.y);
          thing.draw(context);
          thing.drawBorder(context);
        }
        context.restore();
      }
    }
  }
});
