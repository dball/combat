Combat.actions = {
  active: null,
  triggers: {
    keys: {},
    mouse: {}
  },
  register: function(action) {
    if (action.trigger.mouse) {
      this.triggers.mouse[action.trigger.mouse] = action;
    } else {
      this.triggers.keys[action.trigger] = action;
    }
  },
  stop: function(action) {
    if (action && (action != this.active)) { throw 'You can only stop the active action'; }
    this.active = null;
    if (action.end) { action.end(); }
  },
  start: function(action, evt) {
    if (this.active) { throw 'You cannot start multiple actions at once'; }
    this.active = action;
    action.begin(evt);
  },
  click: function(evt) {
    var action = Combat.actions.active;
    if (action != null) {
      if (action.click) { action.click(evt); }
    } else if (action = Combat.actions.triggers.mouse.click) {
      Combat.actions.start(action, evt);
    }
  },
  mousemove: function(evt) {
    var action = Combat.actions.active;
    if (action && action.mousemove) {
      action.mousemove(evt);
    }
  },
  keypress: function(evt) {
    var action = Combat.actions.active;
    if (action != null) {
      evt.preventDefault();
      if (evt.keyCode == KeyEvent.DOM_VK_ESCAPE) { Combat.actions.stop(action); }
      else if (action.keypress) { action.keypress(evt); }
    } else {
      var key = evt.charCode != 0 ? String.fromCharCode(evt.charCode) : evt.keyCode
      if (action = Combat.actions.triggers.keys[key]) {
        evt.preventDefault(); Combat.actions.start(action, evt);
      }
    }
  },
  bind: function(element) {
    element.click(this.click);
    element.mousemove(this.mousemove);
    $(document).keypress(this.keypress);
    document.addEventListener("dragover", function(event) {
      event.preventDefault();
    }, true);
    document.addEventListener("drop", function(event) {
      event.preventDefault();
      var dt = event.dataTransfer;
      var files = dt.files;
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();  
        reader.onload = function(event) {
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
                json.x = 0;
                json.y = 0;
                json.width = 1;
                json.height = 1;
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
