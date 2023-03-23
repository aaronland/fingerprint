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
	}
    };

    return self;
    
})();
