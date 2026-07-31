var fingerprint = fingerprint || {};

fingerprint.offline = (function(){

    var self = {

	purge: function(){

	    offline.application.purge_with_confirmation()
		   .then((rsp) => {
		       fingerprint.feedback.success("Offline cache removed.");
		   }).catch((err) => {
		       console.error("Failed to remove offline cache", err);
		       fingerprint.feedback.error("Failed to remove offline cache, " + err);
		   });
	},
    };

    return self;

})();    
