var offline = offline || {};

offline.application = (function(){

    var self = {
	
	init: function(scope){

	    return new Promise((resolve, reject) => {
		
		if (!("serviceWorker" in navigator)) {
		    reject("Service workers not available.");
		    return;
		}
		
		var sw_uri = scope + "sw.js";
		
		var sw_args = {
		    scope: scope,
		};

		console.log("register service worker", sw_uri, sw_args);
		
		navigator.serviceWorker.register(sw_uri, sw_args).then((registration) => {

		    console.log("sw registered", sw_args);

		    if (navigator.onLine){

			console.debug("update sw registration");
			
			registration.update().then((rsp) => {
			    console.log("sw registration updated");
			    resolve();
			}).catch((err) => {
			    console.warn("failed to update sw registration", err);
			    resolve();
			});
		    }
		    
		    resolve();
		    
		}).catch((err) => {
		    console.error("Failed to register service worker", err);
		    reject(err);
		});
		
	    });
	    
	},

	purge_with_confirmation: function(prefix){

	    return new Promise((resolve, reject) => {
		
		if (! confirm("Are you sure you want to delete all the application caches and unregister the service worker? This can not be undone.")){
		    resolve(false);
		    return;
		}

		if (! navigator.onLine){
		    
		    if (! confirm("Are you really sure? You appear to be offline and deleting the application cache will probably cause offline support to stop working until you are online again.")){
			resolve(false);
			return;
		    }
		}
		
		self.purge(prefix).then((rsp) => {
		    resolve(rsp);
		}).catch((err) => {
		    reject(err);
		});
	    });
	},
	
	purge: function(prefix){

	    return new Promise((resolve, reject) => {
		
		const cachePrefix = typeof prefix === 'string' ? prefix : '';

		caches.keys().then(function (cachesNames) {
		    
                    console.debug("Delete " + document.defaultView.location.origin + " caches");

                    return Promise.all(cachesNames.map(function (cacheName) {
			
			if (! cacheName.startsWith(cachePrefix)){
			    return Promise.resolve();
			}
			
			return caches.delete(cacheName).then(function () {
			    console.debug("Cache with name " + cacheName + " is deleted");
			}); 
                    }));
                
		}).then(function () {
                    console.debug("All matching caches are deleted");
                    
                    if ("serviceWorker" in navigator) {
                        return navigator.serviceWorker.getRegistrations().then(function(registrations) {
                            return Promise.all(registrations.map(function(registration) {
                                console.debug("Unregistering service worker:", registration.scope);
                                return registration.unregister();
                            }));
                        });
                    }
		    
                    return Promise.resolve();

		}).then(function() {
		    console.debug("Service workers unregistered successfully");
		    resolve(true);
		}).catch((err) => {
		    console.error("Failed to fully purge application, ", err);
		    reject(err);
		});
		
	    });
	},

	add_purge_button: function(el, prefix){ // Accept prefix here if passed dynamically

	    var purge_el = document.createElement("span");
	    purge_el.setAttribute("id", "purge");
	    purge_el.appendChild(document.createTextNode("purge offline cache"));
	    
	    purge_el.onclick = function(){
		
		offline.application.purge_with_confirmation(prefix).then((purged) => {
		    if (purged){
			alert("Offline cache and service worker have been completely removed. Reloading page...");
			document.defaultView.location.reload();
		    }
		}).catch((err) => {
		    alert("Failed to purge offline cache, " + err);
		});
		
		return false;
	    };

	    el.appendChild(purge_el);
	},
    };

    return self;
    
})();
