var fingerprint = fingerprint || {};

fingerprint.controls = (function(){

    var self = {

	draw: function(){
	    
	    var draw = document.getElementById("draw");
	    var erase = document.getElementById("erase");
	    var zoom = document.getElementById("zoom");    

	    draw.style.backgroundColor = "#ccc";
	    erase.style.backgroundColor = "#fff";
	    // zoom.style.backgroundColor = "#fff";
	    
	    fingerprint.application.sketchpad.editing(true);
	    
	    if (fingerprint.application.panzoom){
		fingerprint.application.panzoom.disable();
	    }

	    var pen = fingerprint.application.sketchpad.pen();
	    
	    if (pen.curves()){
		var curves = document.getElementById("curves");	    	    	    		
		curves.style.backgroundColor = "#ccc";						
	    }	    
	},
	
	erase: function(){
	    
	    var draw = document.getElementById("draw");    
	    var erase = document.getElementById("erase");
	    var curves = document.getElementById("curves");	    
	    var zoom = document.getElementById("zoom");
	    
	    draw.style.backgroundColor = "#fff";
	    curves.style.backgroundColor = "#fff";
	    
	    // zoom.style.backgroundColor = "#fff";    
	    erase.style.backgroundColor = "#ccc";
	    
	    fingerprint.application.sketchpad.editing("erase");
	    
	    if (fingerprint.application.panzoom){
		fingerprint.application.panzoom.disable();
	    }
	    
	},

	curves: function(){

	    var curves = document.getElementById("curves");
	    
	    var pen = fingerprint.application.sketchpad.pen();
	    
	    if (pen.curves()){
		curves.style.backgroundColor = "#fff";						
		pen.curves(false);
	    } else {
		curves.style.backgroundColor = "#ccc";			    	    
		pen.curves(true);
	    }
	},
	
	zoom: function(){

	    var draw = document.getElementById("draw");
	    var erase = document.getElementById("erase");
	    var zoom = document.getElementById("zoom");    
	    
	    draw.style.backgroundColor = "#fff";
	    erase.style.backgroundColor = "#fff";
	    // zoom.style.backgroundColor = "#ccc";
	    
	    fingerprint.application.sketchpad.editing(false);
	    
	    if (! fingerprint.application.panzoom){
		var paper = fingerprint.application.sketchpad.paper();
		fingerprint.application.panzoom = paper.panzoom();
		fingerprint.application.panzoom.enable();
	    } else {
		fingerprint.application.panzoom.enable();
	    }
	    
	},
	
	undo: function(){
	    
	    if (fingerprint.application.sketchpad.undoable()){
		fingerprint.application.sketchpad.undo();
	    }
	    
	    return false;
	    
	},
	
	redo: function(){
	    
	    if (fingerprint.application.sketchpad.redoable()){    
		fingerprint.application.sketchpad.redo();
	    }
	    
	},

	update: function(){

	    var undo = document.getElementById("undo");    
	    var redo = document.getElementById("redo");
	    
	    var draw = document.getElementById("draw");    
	    var erase = document.getElementById("erase");
	    
	    var new_panel = document.getElementById("menu-contents-new");
	    var save_panel = document.getElementById("menu-contents-save");
	    var delete_panel = document.getElementById("menu-contents-delete");        

		if (fingerprint.application.sketchpad.undoable()){
		    undo.style.display = "block";
		    erase.style.display = "block";
		    save_panel.style.display = "block";
		} else {
		    undo.style.display = "none";
		    erase.style.display = "none";
		    save_panel.style.display = "none";	    
		}
		
		if (fingerprint.application.sketchpad.redoable()){
		    redo.style.display = "block";
		} else {
		    redo.style.display = "none";
		}
	    
	},
    };

    return self;
})();
