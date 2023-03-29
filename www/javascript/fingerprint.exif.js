var fingerprint = fingerprint || {};

fingerprint.exif = (function(){

    var self = {

	init: function(){
	    return sfomuseum.wasm.fetch("../wasm/update_exif.wasm");
	},

    };

    return self
    
})();
