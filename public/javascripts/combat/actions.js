Combat.actions = {
  active: null,
  create: function(params) {
    this.begin = function(evt) { params.begin(evt); console.log("begin", this); }
    this.end = function(evt) { if (params.end) { params.end(evt); }; console.log("end", this); }
  },
  triggers: {
    keys: {}
  },
  register: function(params) {
    // Is the new worthwhile at all?
    this.triggers.keys[params.trigger] = new this.create(params);
  },
  click: function(evt) {
    var action = Combat.actions.active;
    if (action != null) {
      if (action.click) { action.click(evt); }
    } else if (action = Combat.actions.active = Combat.actions.triggers.mouse.click != null) {
      action.begin(evt);
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
      if (evt.keyCode == KeyEvent.DOM_VK_ESCAPE) { Combat.actions.active = null; action.end(); } 
      else if (action.keypress) { action.keypress(evt); }
    } else {
      var key = evt.charCode != 0 ? String.fromCharCode(evt.charCode) : evt.keyCode
      if (action = Combat.actions.active = Combat.actions.triggers.keys[key]) {
        evt.preventDefault(); action.begin(evt);
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
