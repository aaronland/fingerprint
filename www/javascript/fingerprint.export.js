var fingerprint = fingerprint || {};

fingerprint.export = (function(){

    var self = {

	dialog: function(){

	    var el = document.getElementById("export-dialog");
	    
	    var ts = Math.floor(Date.now() / 1000);
	    
	    var filename = "fingerprint-" + ts;
	    
	    var filename_el = document.getElementById("export-dialog-name");
	    filename_el.value = filename;

	    var onchange = function(e){
		
		var type_el = document.getElementById("export-dialog-type");
		var type = type_el.value

		var wrapper_el = document.getElementById("export-dialog-dimension-wrapper");
		var exif_el = document.getElementById("export-dialog-exif-wrapper");		

		switch (type) {
		    case "jpeg":
			wrapper_el.style.display = "block";

			if (fingerprint.capabilities.update_exif()){
			    exif_el.style.display = "block";
			}
			
			break;			
		    case "png":
			wrapper_el.style.display = "block";
			exif_el.style.display = "none";						
			break;
		    default:
			wrapper_el.style.display = "none";
			exif_el.style.display = "none";			
			break;
		}
	    };
	    
	    var type_el = document.getElementById("export-dialog-type");	    
	    type_el.onchange = onchange;

	    onchange();
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
		    case "jpeg":

			var dimension_el = document.getElementById("export-dialog-dimension");
			var max_dimension = dimension_el.value;

			var update_exif_el = document.getElementById("export-dialog-update-exif");
			var do_update_exif = update_exif_el.checked;

			var exif_data;

			if ((do_update_exif) && (fingerprint.capabilities.update_exif())){

			    var svg_el = fingerprint.render.asSVGElement();
			    var date = svg_el.getAttribute("x-fingerprint-date");
			    
			    exif_data = {
				"DateTime": date,
				"DateTimeOriginal": date,
				"DateTimeDigitized": date,
			    };
			}

			self.export_jpeg(name, max_dimension, exif_data);
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
	    
	    fingerprint.render.asImage(max_dimension, "image/png", 1).then((blob) => {
		saveAs(blob, fname);
	    }).catch((err) => {
		console.log(err)
	    });
	},

	export_jpeg: function(name, max_dimension, exif_data){
	    
	    var fname = name + ".jpg";
	    
	    fingerprint.render.asImage(max_dimension, "image/jpeg", 1).then((blob) => {

		if ((exif_data) && (fingerprint.capabilities.update_exif())) {

		    const reader = new FileReader();
		    
		    reader.addEventListener("loadend", () => {
			
			var enc_update = JSON.stringify(exif_data);			
			var b64_img = reader.result;
			
			update_exif(b64_img, enc_update).then(data_url => {

			    var blob = self.dataURLToBlob(data_url);
    			    saveAs(blob, fname);
			    
			});
			
		    });
		    
		    reader.readAsDataURL(blob);
		    
		} else {
		    saveAs(blob, fname);
		}
		
	    }).catch((err) => {
		console.log(err)
	    });
	},

	dataURLToBlob: function(dataURL){

	    var BASE64_MARKER = ";base64,";
	    
	    if (dataURL.indexOf(BASE64_MARKER) == -1){
		
		var parts = dataURL.split(",");
		var contentType = parts[0].split(":")[1];
		var raw = decodeURIComponent(parts[1]);
		
		return new Blob([raw], {type: contentType});
	    }
	    
	    var parts = dataURL.split(BASE64_MARKER);
	    var contentType = parts[0].split(":")[1];
	    var raw = window.atob(parts[1]);
	    var rawLength = raw.length;
	    
	    var uInt8Array = new Uint8Array(rawLength);
	    
	    for (var i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	    }
	    
	    return new Blob([uInt8Array], {type: contentType});
	},
	
    };

    return self;
    
})();
