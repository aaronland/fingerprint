var fingerprint = fingerprint || {};

fingerprint.feedback = (function(){

    var self = {

	info: function(msg){

	    Toastify({
		text: msg,
		duration: 1500,
		newWindow: true,
		close: true,
		gravity: "top",
		position: "right",
		stopOnFocus: true,
		style: {
		    background: "#fff",
		    color: "#000",
		},
		onClick: function(){} // Callback after click
	    }).showToast();
	    
	},

	error: function(msg){
	    console.log(msg);

	    Toastify({
		text: msg,
		duration: -1,
		newWindow: true,
		close: true,
		gravity: "top",
		position: "right",
		stopOnFocus: true,
		style: {
		    background: "#fff",
		    color: "#000",
		},
		onClick: function(){} // Callback after click
	    }).showToast();
	    
	},

	success: function(msg){
	    self.info(msg);
	},
	
    };

    return self;
})();
