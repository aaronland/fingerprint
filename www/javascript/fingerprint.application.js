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

	    /*

	    // https://stackoverflow.com/questions/41636754/how-to-clear-a-service-worker-cache-in-firefox
	       
	    caches.keys().then(function (cachesNames) {
		console.log("Delete " + document.defaultView.location.origin + " caches");
		return Promise.all(cachesNames.map(function (cacheName) {
		    return caches.delete(cacheName).then(function () {
			console.log("Cache with name " + cacheName + " is deleted");
		    });
		}))
	    }).then(function () {
		console.log("All " + document.defaultView.location.origin + " caches are deleted");
	    });
	    
	    */
	    
	    var offline_scope = '/panels2/';
	    fingerprint.offline.init(offline_scope);

	},

    };

    return self;

})();
