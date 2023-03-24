var fingerprint = fingerprint || {};

fingerprint.storage = (function(){

    var self = {

	init: function(){
	    localforage.config();
	},
	
	set: function(key, item){

	    var dt = new Date();
	    var ts = dt.getTime();
	    
	    item['created'] = ts;

	    return localforage.setItem(key, item);
	},

	get: function(key) {

	    return localforage.getItem(key);
	},

	unset: function(key) {

	    return localforage.removeItem(key);
	},

	list: function() {

	    return localforage.keys()
	},

	load_dialog: function(){

	    var data = fingerprint.application.sketchpad.strokes();
	    
	    if (data.length > 0 ){

		if (! confirm("You are currently working on a drawing. Do you want to replace it?")){
		    return false;
		}
	    }

	    self.list().then((keys) => {

		var count = keys.length;
		
		if (count == 0){
		    return;
		}

		var preview_el = document.getElementById("list-dialog-preview");
		preview_el.innerHTML = "";
		
		var select_el = document.getElementById("list-dialog-image");
		select_el.innerHTML = "";

		var option = document.createElement("option");
		select_el.appendChild(option);
		
		for (var i=0; i < count; i++){

		    var image = keys[i];
		    var option = document.createElement("option");
		    option.setAttribute("value", image);

		    option.appendChild(document.createTextNode(image));
		    select_el.appendChild(option);
		}

		select_el.onchange = function(e){

		    var el = e.target;
		    var key = el.value;

		    if (! key){
			return false;
		    }

		    self.get(key).then((item) => {

			var preview_el = document.getElementById("list-dialog-preview");
			preview_el.innerHTML = "";
			
			var strokes = JSON.parse(item["data"]);

			var sketchpad = Raphael.sketchpad("list-dialog-preview", {
			    width: item["width"],
			    height: item["height"],
			    strokes: strokes,
			    editing: false
			});

			var svg_node = preview_el.getElementsByTagName("svg")[0];
			var svg_el = svg_node.cloneNode(true);
			
			var svg_w = parseInt(svg_el.getAttribute("width"));
			var svg_h = parseInt(svg_el.getAttribute("height"));		
			
			if (svg_w > svg_h){
			    new_w = 100;
			    new_h = (new_w / svg_w) * svg_h;
			} else {
			    new_h = 100;
			    new_w = (new_h / svg_h) * svg_w;
			}
			
			var viewbox = "0 0 " + svg_w + " " + svg_h;
			svg_el.setAttribute("viewBox", viewbox);
			svg_el.setAttribute("height", new_h);
			svg_el.setAttribute("width", new_w);

			svg_node.replaceWith(svg_el);
			
		    }).catch((err) => {
			console.log("SAD", err);
		    });

		    return false;
		};
		
		var dialog_el = document.getElementById("list-dialog");
		dialog_el.showModal();
		
	    }).catch((err) => {
		fingerprint.feedback.error("Failed to list locally stored images, " + err);		
	    });

	    return false;
	},

	load: function(key){

	    var dialog_el = document.getElementById("list-dialog");
	    dialog_el.close();

	    var select_el = document.getElementById("list-dialog-image");
	    var key = select_el.value;
	    
	    self.get(key).then((item) => {

		fingerprint.drawing.load(item, key);
		
	    }).catch((err) => {
		fingerprint.feedback.error("Failed to load '" + key + "', " + err);
		return false;		
	    });

	},

	save_dialog: function(){

	    var editor_el = document.getElementById("editor");
	    var filename = editor_el.getAttribute("data-panel-title");

	    if (! filename){
		var ts = Math.floor(Date.now() / 1000);
		filename = "fingerprint-" + ts;
	    }
	    
	    var filename_el = document.getElementById("save-dialog-filename");
	    filename_el.value = filename;
	    
	    var dialog_el = document.getElementById("save-dialog");
	    dialog_el.showModal();
	},

	save: function(){

	    var dialog_el = document.getElementById("save-dialog");
	    dialog_el.close();
	    
	    var filename_el = document.getElementById("save-dialog-filename");
	    var key = filename_el.value;

	    self.save_with_name(key, true);
	},
	
	save_with_name: function(key, show_feedback){
		
	    var json = fingerprint.render.asJSON();
	    
	    if (fingerprint.drawing.is_empty(json)){
		// fingerprint.feedback.error("There's nothing to save");
		return false;
	    }

   	    var editor_el = document.getElementById("editor");
	    var h = editor_el.offsetHeight;
	    var w = editor_el.offsetWidth;

	    var item = {
		'data': json,
		'height': h,
		'width': w
	    };

	    self.set(key, item).then((rsp) => {

		if (show_feedback){
		    fingerprint.feedback.success("Saved image '" + key + "'");
		}
		
		self.toggle_list_icon();
		    
	    }).catch((err) => {
		fingerprint.feedback.error("Failed to save image, " + err);
	    });
	    
	},

	remove: function(key){

	    var editor_el = document.getElementById("editor");
	    
	    if (! key){
		key = editor_el.getAttribute("data-panel-title");	
	    }

	    if (! key){

		if (confirm("Are you sure you want to delete this?")){		
		    fingerprint.drawing.load();
		}
		
		return false;
	    }
	    
	    if (! confirm("Are you sure you want to delete " + key + "?")){
		return false;
	    }
	    
	    editor_el.removeAttribute("data-panel-title");

	    self.unset(key).then((rsp) => {
		fingerprint.feedback.success("Image was removed from local storage");
		fingerprint.drawing.load();
		fingerprint.menu.hide_viewsource_control();	
		fingerprint.menu.hide_remove_control();	
	    }).catch((err) => {
		fingerprint.feedback.error("There was a problem removing that image, " + err);
	    });
	},

	toggle_list_icon: function(){

	    var el = document.getElementById("menu-contents-list");
	    
	    self.list().then((keys) => {

		if (keys.length){
		    el.style.display = "block";
		} else {
		    el.style.display = "none";		    
		}
	
	    }).catch((err) => {
		fingerprint.feedback.error("Failed to list local items, " + err);
	    });
	    
	},

	enable_autosave: function(key){

	    if (! key){
		key = "work in progress";
	    }
	    
	    setInterval(function(){
		console.log("auto save \"" + key + "\"");
		fingerprint.storage.save_with_name(key, false);
	    }, 60000);
	    
	}
    };

    return self;
    
})();
