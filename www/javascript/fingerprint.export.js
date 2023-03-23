var fingerprint = fingerprint || {};

fingerprint.export = (function(){

    var self = {

	dialog: function(){

	    var el = document.getElementById("export-dialog");
	    
	    var ts = Math.floor(Date.now() / 1000);
	    
	    var filename = "fingerprint-" + ts;
	    
	    var filename_el = document.getElementById("export-dialog-name");
	    filename_el.value = filename;

	    var type_el = document.getElementById("export-dialog-type");
	    
	    type_el.onchange = function(e){
		
		var type_el = document.getElementById("export-dialog-type");
		var type = type_el.value

		var wrapper_el = document.getElementById("export-dialog-dimension-wrapper");

		switch (type) {
		    case "png":
			wrapper_el.style.display = "block";
			break;
		    default:
			wrapper_el.style.display = "none";
			break;
		}
	    };
	    
	    el.showModal();
	},
	
	export: function(){

	    var type_el = document.getElementById("export-dialog-type");
	    var type = type_el.value;
	    
	    if (! type){
		alert("Required type missing.");
		return false;
	    }
	    
	    var name_el = document.getElementById("export-dialog-name");
	    var name = name_el.value;
	    
	    if (! name){
		alert("Required name missing.");	
		return false;
	    }
	    
	    var d = document.getElementById("export-dialog");
	    d.close();
	    
	    try {
		
		switch (type){
		    case "json":
			self.export_json(name);
			break;
		    case "svg":
			self.export_svg(name);
			break;
		    case "png":

			var dimension_el = document.getElementById("export-dialog-dimension");
			var max_dimension = dimension_el.value;
			
			self.export_png(name, max_dimension);
			break;	    		
		    default:
			break;
		}
		
	    } catch(err) {
		console.log(err);
		alert("Failed to export image, " + err);
		return false;
	    }
	    
	    return false;
	    
	},

	export_json: function(name){

	    var data = fingerprint.render.asJSON();
	    enc_json = JSON.stringify(data);
	    
	    var fname = name + ".json";
	    
	    var file = new File([enc_json], fname, {type: "application/json;charset=utf-8"});
	    
	    saveAs(file);
	    return false;
	},

	export_svg: function(name){

	    var data = fingerprint.application.sketchpad.json();
	    
	    if (fingerprint.drawing.is_empty(data)){
		return false;
	    }
	    
	    var svg = fingerprint.render.asSVGString();
	    
	    var fname = name + ".svg";
	    
	    var file = new File([svg], fname, {type: "image/xml+svg;charset=utf-8"});    
	    
	    saveAs(file);
	    return false;
	},

	export_png: function(name, max_dimension){
	    
	    var fname = name + ".png";
	    
	    fingerprint.render.asPNG(max_dimension).then((blob) => {
		saveAs(blob, fname);
	    }).catch((err) => {
		console.log(err)
	    });
	},
	
    };

    return self;
    
})();
