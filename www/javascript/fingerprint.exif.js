var fingerprint = fingerprint || {};

fingerprint.exif = (function(){

    var self = {

	init: function(){
	    var wasm_url = location.href + "wasm/update_exif.wasm";
	    return sfomuseum.wasm.fetch(wasm_url);
	},

    };

    return self
    
})();
