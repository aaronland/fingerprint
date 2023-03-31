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
		var exif_el = document.getElementById("share-dialog-exif-wrapper");
		
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

		    var svg_filename = filename + ".svg";	
		    var svg_data = fingerprint.render.asSVGString();

		    const svg_blob = new Blob([svg_data], {type: 'image/svg+xml'});

		    const f = new File([svg_blob], svg_filename);
		    share_data["files"] = [f];
		    
		    self.shareItem(share_data);
		    break;
		    
		case "png":

		    var dimension_el = document.getElementById("share-dialog-dimension");
		    var max_dimension = dimension_el.value;
		    
		    filename = filename + ".png";
		    
		    fingerprint.render.asImage(max_dimension, "image/png", 1).then((blob) => {

			const f = new File([blob], filename);
			share_data["files"] = [f];
			
			self.shareItem(share_data);
			
		    }).catch((err) => {
			fingerprint.feedback.error("Unable to generate image, " + err);			    			
		    });
		    
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
		    
		    fingerprint.render.asImage(max_dimension, "image/jpeg", 1).then((blob) => {

			if ((! exif_data) || (! fingerprint.capabilities.update_exif())){

			    const f = new File([blob], filename);
			    share_data["files"] = [f];
			    
			    self.shareItem(share_data);
			    return;
			}

			const reader = new FileReader();
			
			reader.addEventListener("loadend", () => {
			    
			    var enc_update = JSON.stringify(exif_data);			
			    var b64_img = reader.result;
			    
			    update_exif(b64_img, enc_update).then(data_url => {
				
				var blob = self.dataURLToBlob(data_url);

				const f = new File([blob], filename);
				share_data["files"] = [f];
				
    				self.shareItem(share_data);
				
			    });
			    
			});
		    
			reader.readAsDataURL(blob);
			
		    }).catch((err) => {
			fingerprint.feedback.error("Unable to generate image, " + err);			    			
		    });
		    
		    
		default:
		    fingerprint.feedback.error("Invalid share option.");
		    break;
	    },
	},
	
	shareItem: function(share_data) {
	    	    
	    navigator.share(share_data).then(() => {
		fingerprint.feedback.success(share_data["title"] + " was shared");			    
	    }).catch((err) => {
		fingerprint.feedback.error("Unable to share, " + err);			    
	    });
	    
	},
		
    };

    return self;
})();
