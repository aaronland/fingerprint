/* https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers#service_workers_explained */
/* https://github.com/mdn/pwa-examples/blob/main/js13kpwa/sw.js */
/* https://web.dev/learn/pwa/service-workers/ */
/* https://webkit.org/blog/8090/workers-at-your-service/ */

var fingerprint = fingerprint || {};

fingerprint.offline = (function(){

    var self = {
	
	init: function(scope){

	    if ("serviceWorker" in navigator) {

		var sw_uri = "sw.js";
		
		var sw_args = {
		    scope: scope,
		};
		
		navigator.serviceWorker.register(sw_uri, sw_args).then((registration) => {
		    console.log("sw registered");
		    registration.update();
		}).catch((err) => {
		    console.log("SAD", err);
		});
		
	    }
	},

	purge_with_confirmation: function(){

	    if (! confirm("Are you sure you want to delete all the application caches? This can not be undone.")){
		return false;
	    }

	    if (! navigator.onLine){

		if (! confirm("Are you really sure? You appear to be offline and deleting the application cache will probably cause offline support to stop working until you are online again.")){
		    return false;
		}
	   }
	    
	    self.purge();
	},
	
	purge: function(){

	    caches.keys().then(function (cachesNames) {
		
                console.log("Delete " + document.defaultView.location.origin + " caches");

                return Promise.all(cachesNames.map(function (cacheName) {

		    if (! cacheName.startsWith("fingerprint-")){
			return Promise.resolve();
		    }
		    
		    return caches.delete(cacheName).then(function () {
			console.log("Cache with name " + cacheName + " is deleted");
                    }); 
                }))
                
            }).then(function () {
                console.log("All " + document.defaultView.location.origin + " caches are deleted");
                fingerprint.feedback.success("All caches have been deleted.");		
            }).catch((err) => {
		console.log("Failed to remove caches, ",err);
		fingerprint.feedback.error("Failed to remove caches, " + err);
	    });  
	},
    };

    return self;
    
})();
