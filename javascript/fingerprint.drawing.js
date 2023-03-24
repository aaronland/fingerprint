var fingerprint = fingerprint || {};

fingerprint.drawing = (function(){

    var self = {

	new: function(item, key){

	    if (fingerprint.application.sketchpad){
		
		var json = fingerprint.application.sketchpad.json();
		
		if (! self.is_empty(json)){
		    
		    if (! confirm("You've started a sketch. Do you want to overwrite it?")){
			return false;
		    }
		}
	    }
	    
	    return self.load(item, key);
	},
	
	load: function(item, key){

	    var wrapper_el = document.getElementById("wrapper");
	    var editor_el = document.getElementById("editor");
	    
	    editor_el.innerHTML = "";

	    if (key){
		editor_el.setAttribute("data-panel-title", key);
	    } else {
		editor_el.removeAttribute("data-panel-title");
	    }
	    
	    var w = wrapper_el.offsetWidth;
	    var h = wrapper_el.offsetHeight;
	    
	    var args = {
		width: w,
		height: h,
		editing: true
	    };
	    
	    if (item){

		if (item['strokes']){
		    args['strokes'] = item['strokes'];
		    
		} else if (item['data']){
		    
		    try {
			var strokes = JSON.parse(item['data']);
			args['strokes'] = strokes;
		    }
		    
		    catch (e){
			
			fingerprint.feedback.error("Failed to load that document because " + e);
			return false;
		    }
		    
		} else {

		    fingerprint.feedback.error("Drawing is missing strokes");		    
		}
		
		if ((item['width']) && (item['width'] > args['width'])){
		    args['width'] = item['width'];
		}
		
		if ((item['height']) && (item['height'] > args['height'])){
		    args['height'] = item['height'];
		}
	    }	   

	    fingerprint.application.sketchpad = Raphael.sketchpad("editor", args);
	    
	    var pen = fingerprint.application.sketchpad.pen();

	    var colour = fingerprint.colours.get_colour();
	    var opacity = fingerprint.colours.get_opacity();
	    
	    pen.opacity(opacity);
	    pen.color(colour);

	    fingerprint.menu.update();
	    fingerprint.controls.update();
	    
	    fingerprint.application.sketchpad.change(function() {		
		fingerprint.controls.update();		
		fingerprint.menu.update();		
	    });
	    	    
	    addEventListener("resize", (event) => {
		
		var paper = fingerprint.application.sketchpad.paper();
		var wr = document.getElementById("wrapper");
		
		var new_w = wr.offsetWidth;
		var new_h = wr.offsetHeight;
		
		if ((new_w > w) && (new_h > h)){
		    paper.setSize(new_w, new_h);
		} else if (new_w > w) {
		    paper.setSize(new_w, h);
		} else if (new_h > h) {
		    paper.setSize(w, new_h);
		}
		
	    });
	    
	},

	is_empty: function(data){

	    if (! data){
		return true;
	    }
	    
	    if ((typeof(data) == 'string') && (data == '[]')){
		return true;
	    }
	    
	    if ((typeof(data) == 'object') && (data.length == 0)){
		return true;
	    }
	    
	    return false
	},
	
    };

    return self;

})();
