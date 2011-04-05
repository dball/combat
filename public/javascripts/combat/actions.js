Combat.actions = {
  active: null,
  controls: null,
  triggers: {
    keys: {},
    mouse: {},
    controls: [],
  },
  flags: {
    swallowClick: false
  },
  draw: function(context) {
    if (this.active && this.active.draw) { this.active.draw(context); }
  },
  register: function(action) {
    if (action.trigger.mouse) {
      this.triggers.mouse[action.trigger.mouse] = action;
    }
    if (action.trigger.key) {
      this.triggers.keys[action.trigger.key] = action;
    }
    if (action.trigger.control) {
      this.triggers.controls.push(action);
    }
  },
  stop: function(action) {
    if (action && (action != this.active)) { throw 'You can only stop the active action'; }
    if (this.active && this.active.end) { this.active.end(); }
    this.active = null;
  },
  start: function(action, evt) {
    if (this.active) { throw 'You cannot start multiple actions at once'; }
    this.active = action;
    var args = Array.prototype.slice.call(arguments);
    action.begin.apply(action, args.slice(1));
  },
  click: function(evt) {
    if (Combat.actions.flags.swallowClick) {
      Combat.actions.flags.swallowClick = false;
      return;
    }
    var action = Combat.actions.active;
    if (action != null) {
      if (action.click) { action.click(evt); }
    } else if (action = Combat.actions.triggers.mouse.click) {
      Combat.actions.start(action, evt);
    }
  },
  mousemove: function(evt) {
    var action = Combat.actions.active;
    if (action && action.mousemove) { action.mousemove(evt); }
  },
  mousedown: function(evt) {
    var action = Combat.actions.active;
    if (action && action.mousedown) { action.mousedown(evt); }
  },
  mouseup: function(evt) {
    var action = Combat.actions.active;
    if (action && action.mouseup) { action.mouseup(evt); /* Combat.actions.flags.swallowClick = true; */ }
  },
  mouseenter: function(evt) {
    var action = Combat.actions.active;
    if (action && action.mouseenter) { action.mouseenter(evt); }
  },
  mouseleave: function(evt) {
    var action = Combat.actions.active;
    if (action && action.mouseleave) { action.mouseleave(evt); }
  },
  mousewheel: function(evt, delta) {
    var action = Combat.actions.active;
    if (action) {
      if (action.mousewheel) { action.mousewheel(evt, delta); }
    } else if (action = Combat.actions.triggers.mouse.wheel) {
      Combat.actions.start(action, evt, delta);
    }
  },
  keypress: function(evt) {
    if (evt.keyCode == KeyEvent.DOM_VK_ESCAPE) {
      evt.preventDefault();
      Combat.actions.stop();
      return;
    }
    if ($(evt.target).is(":input")) { return; }
    var action = Combat.actions.active;
    if (action != null) {
      if (evt.keyCode == KeyEvent.DOM_VK_ESCAPE) { Combat.actions.stop(action); }
      else if (action.keypress) { action.keypress(evt); }
    } else {
      var key = evt.charCode != 0 ? String.fromCharCode(evt.charCode) : evt.keyCode
      if (action = Combat.actions.triggers.keys[key]) {
        evt.preventDefault(); Combat.actions.start(action, evt);
      }
    }
  },
  gesturechange: function(evt) {
  },
  gesturestart: function(evt) {
  },
  gestureend: function(evt) {
  },
  bind: function(canvas, controls) {
    canvas.click(this.click);
    canvas.mousemove(this.mousemove);
    canvas.mousedown(this.mousedown);
    canvas.mouseup(this.mouseup);
    canvas.mousewheel(this.mousewheel);
    canvas.mouseenter(this.mouseenter);
    canvas.mouseleave(this.mouseleave);
    $(document).keypress(this.keypress);
    $.each(this.triggers.controls, function() { this.bind(controls.find("*[data-control='" + this.trigger.control + "']")); });
    $(window).resize(function() {
      Combat.map.resize(true);
    });
    /*
    document.addEventListener('gesturestart', this.gesturestart, false);
    document.addEventListener('gesturechange', this.gesturechange, false);
    document.addEventListener('gestureend', this.gestureend, false);
    document.addEventListener('touchmove', function(event) { event.preventDefault(); });
    document.addEventListener('touchstart', function(event) { event.preventDefault(); });
    */
    document.addEventListener("dragover", function(event) { event.preventDefault(); }, true);
    document.addEventListener("drop", function(drop_event) {
      drop_event.preventDefault();
      var dt = drop_event.dataTransfer;
      var files = dt.files;
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();  
        reader.onload = function(load_event) {
          var xhr = new XMLHttpRequest();  
          xhr.open("POST", Combat.url + "/images", true);  
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          xhr.setRequestHeader("Content-Length", file.fileSize);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.sendAsBinary(this.result);
          xhr.onreadystatechange = function (e) {  
            if (xhr.readyState == 4) {  
              if (xhr.status == 201) {
                var json = $.parseJSON(xhr.responseText);
                var point = Combat.map.point(drop_event);
                json.x = point.tile.x;
                json.y = point.tile.y;
                if (json.aspect_ratio < 1) {
                  json.width = 1;
                  json.height = 1 / json.aspect_ratio;
                } else {
                  json.width = json.aspect_ratio;
                  json.height = 1;
                }
                Combat.pictures.create(json);
                Combat.draw();
              } else {
                console.log("error", xhr);
              }
            }
          }
        }
        reader.readAsBinaryString(file);  
      }
    }, true);
  }
}
