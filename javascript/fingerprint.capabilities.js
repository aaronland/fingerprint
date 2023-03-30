var fingerprint = fingerprint || {};

fingerprint.capabilities = (function(){

    var can_share = false;
    var can_export = false;
    var can_fullscreen = false;
    var can_copy_to_clipboard = false;
    var can_update_exif = false;
    
    var max_dimension = 20000;
    
    var self = {

	init: function(){

	    if ((navigator.share) && (navigator.canShare)){
		can_share = true;
	    }
	    
	    if (typeof(ClipboardItem) == "function"){
		can_copy_to_clipboard = true;
	    }

	    if (isFileSaverSupported = !!new Blob){
		can_export = true;
	    }

	    fingerprint.exif.init().then((rsp) => {
		can_update_exif = true;
	    }).catch((err) => {
		console.log("Unable to initialize EXIF WASM, ", err);
	    });
	},
	
	share: function(){
	    return can_share;
	},
	
	export: function(){
	    return can_export;
	},

	fullscreen: function(){
	    return can_fullscreen;
	},

	copy_to_clipboard: function(){
	    return can_copy_to_clipboard;
	},

	max_dimension: function(){
	    return max_dimension;
	},

	update_exif: function(){
	    return can_update_exif;
	},
    };

    return self;
    
})();
