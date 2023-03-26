var fingerprint = fingerprint || {};

fingerprint.application = (function(){
    
    var self = {

	sketchpad: null,

	panzoom: null,
	
	init: function(){
	   
	    fingerprint.capabilities.init();
	    fingerprint.colours.assign_colour("#000", 0.4);
	    fingerprint.drawing.new();
	    fingerprint.storage.toggle_list_icon();
	    fingerprint.storage.enable_autosave();
	    
	    if (fingerprint.capabilities.copy_to_clipboard()){
		var el = document.getElementById("view-source-copy");
		el.style.display = "flex";
	    }

	    window.addEventListener("offline", (e) => {
		fingerprint.menu.show_offline_control();
	    });
	    
	    window.addEventListener("online", (e) => {
		fingerprint.menu.hide_offline_control();		
	    });

	    var offline_scope = document.body.getAttribute("data-offline-scope");

	    if (offline_scope){
		fingerprint.offline.init(offline_scope);
		fingerprint.menu.show_settings_control();
	    }
	},

    };

    return self;

})();
