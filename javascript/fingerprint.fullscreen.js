var fingerprint = fingerprint || {};

fingerprint.fullscreen = (function(){

    var self = {
	request: function(){

	    if (! fingerprint.capabilities.fullscreen()){
		return false;
	    }
	    
	    // https://gist.github.com/simonewebdesign/6183356
	    
	    if (!document.fullscreenElement &&    // alternative standard method
		!document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
		
		if (document.documentElement.requestFullscreen) {
		    document.documentElement.requestFullscreen();
		} else if (document.documentElement.mozRequestFullScreen) {
		    document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullscreen) {
		    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
		
	    } else {
		if (document.cancelFullScreen) {
		    document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
		    document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
		    document.webkitCancelFullScreen();
		}
	    }
	    
	}

	/*

    function fullscreenchanged(event) {

	var enter = document.getElementById("fullscreen-enter");
	var exit = document.getElementById("fullscreen-exit");    

	if ((document.fullscreenElement) || (document.webkitFullscreenElement)){

	    exit.style.display = "block";
	    enter.style.display = "none";	
	    
	} else {

	    exit.style.display = "none";
	    enter.style.display = "block";	
	    
	}
    }
    
    document.addEventListener("fullscreenchange", fullscreenchanged);
    document.addEventListener("webkitfullscreenchange", fullscreenchanged);    
	*/
	
    };

    return self;
})();
