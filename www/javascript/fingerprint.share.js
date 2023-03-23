var fingerprint = fingerprint || {};

fingerprint.share = (function(){

    var self = {

	share_dialog: function(){
	    
	    if (! fingerprint.capabilities.share()){
		return false;
	    }
	    
	    var ts = Math.floor(Date.now() / 1000);
	    
	    var filename = "fingerprint-" + ts;
	    var title = "Fingerprint #" + ts;
	    
	    var filename_el = document.getElementById("share-dialog-filename");
	    filename_el.value = filename;

	    var type_el = document.getElementById("share-dialog-type");
	    
	    type_el.onchange = function(e){

		var type_el = document.getElementById("share-dialog-type");
		var type = type_el.value

		var wrapper_el = document.getElementById("share-dialog-dimension-wrapper");

		switch (type) {
		    case "png":
			wrapper_el.style.display = "block";
			break;
		    default:
			wrapper_el.style.display = "none";
			break;
		}
	    };
	    
	    var title_el = document.getElementById("share-dialog-title");
	    title_el.value = title;
	    
	    var el = document.getElementById("share-dialog");
	    el.showModal();
	},

	share: function(){

	    if (! fingerprint.capabilities.share()){
		return false;
	    }
	    
	    var filename_el = document.getElementById("share-dialog-filename");
	    var filename = filename_el.value;
	    
	    var title_el = document.getElementById("share-dialog-title");
	    var title = title_el.value;
	    
	    var text_el = document.getElementById("share-dialog-text");
	    var text = text_el.value;
	    
	    var type_el = document.getElementById("share-dialog-type");
	    var type = type_el.value;
	    
	    var dialog_el = document.getElementById("share-dialog");
	    dialog_el.close();
	    
	    var share_data = {
		title: title,
		text: text,
	    };

	    switch (type) {
		case "svg":

		    console.log("WUT", filename);
		    
		    var svg_filename = filename + ".svg";	
		    var svg_data = fingerprint.render.asSVGString();

		    const svg_blob = new Blob([svg_data], {type: 'image/svg+xml'});
		    const svg_f = new File([svg_blob], svg_filename);

		    share_data["files"] = [svg_f];

		    navigator.share(share_data).then(() => {
			fingerprint.feedback.success(filename + " was shared");
		    }).catch((err) => {
			fingerprint.feedback.error("Unable to share, " + err);
		    });

		    break;
		    
		case "png":

		    var dimension_el = document.getElementById("share-dialog-dimension");
		    var max_dimension = dimension_el.value;
		    
		    filename = filename + ".png";
		    
		    fingerprint.render.asPNG(max_dimension).then((blob) => {
			
			const f = new File([blob], filename);
			share_data["files"] = [f];
			
			navigator.share(share_data).then(() => {
			    fingerprint.feedback.success(filename + " was shared");			    
			}).catch((err) => {
			    fingerprint.feedback.error("Unable to share, " + err);			    
			});
		    }).catch((err) => {
			fingerprint.feedback.error("Unable to generate image, " + err);			    			
		    });
		    
		    break;
		default:
		    fingerprint.feedback.error("Invalid share option.");
		    break;
	    }
	    
	},
	
    };

    return self;
})();
