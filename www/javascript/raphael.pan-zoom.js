(function () {

    var panZoomFunctions = {
	
        enable: function () {

        },
	
        disable: function () {

        },
    };
    
    var PanZoom = function (el, options) {
	
        var paper = el;
        var container = paper.canvas.parentNode;
        var me = this;

	// Global vars to cache event state
	this.evCache = new Array();
	this.prevDiff = -1;
		
	function remove_event(ev) {
	    
	    // Remove this event from the target's cache
	    for (var i = 0; i < me.evCache.length; i++) {
		if (me.evCache[i].pointerId == ev.pointerId) {
		    fingerprint.feedback.info("remove " + ev.pointerId);
		    me.evCache.splice(i, 1);
		    break;
		}
	    }
	}
        
	var onpointermove = function(ev){

	    ev = window.event || ev;
		  
	    fingerprint.feedback.info("pointermove " + ev.pointerId);
	    
	    // Find this event in the cache and update its record with this event

	    try {
	    for (var i = 0; i < me.evCache.length; i++) {
		
		if (ev.pointerId == me.evCache[i].pointerId) {
		    me.evCache[i] = ev;
		    break;
		}
	    }
	    } catch (err){
		fingerprint.feedback.info("WTF " + err);
	    }
	    
	    fingerprint.feedback.info("move " + ev.pointerId + ":" + me.evCache.length);

	    try {
	    // If two pointers are down, check for pinch gestures
	    if (me.evCache.length == 2) {
		
		// Calculate the distance between the two pointers
		var curDiff = Math.sqrt(Math.pow(me.evCache[1].clientX - me.evCache[0].clientX, 2) + Math.pow(me.evCache[1].clientY - me.evCache[0].clientY, 2));
		
		fingerprint.feedback.info("pointermove 2-finger " + curDiff + " previous " + me.prevDiff);
		
		if (me.prevDiff > 0) {
		    if (curDiff > me.prevDiff) {
			// The distance between the two pointers has increased
			// ev.target.style.background = "pink";
			
			fingerprint.feedback.info("zoom in");
		    }
		    if (curDiff < me.prevDiff) {
			// The distance between the two pointers has decreased
			// ev.target.style.background = "lightblue";
			
			fingerprint.feedback.info("zoom out");			    
		    }
		}
		
		// Cache the distance for the next move event 
		me.prevDiff = curDiff;
	    }

	    }catch(err){
		fingerprint.feedback.info("POO " + err);
	    }
	    /*
	    if (ev.preventDefault) {
		ev.preventDefault();
	    } else {
		ev.returnValue = false;
	    }
	    */
	    
	    return false;
	};
	
	var onpointerdown = function(ev) {

	    ev = window.event || ev;

	    fingerprint.feedback.info("ADD " + ev.pointerId);
	    me.evCache.push(ev);

	    /*
	    if (ev.preventDefault) {
		ev.preventDefault();
	    } else {
		ev.returnValue = false;
	    }
	    
            return false;
	    */
	};
	
	var onpointerup = function(ev){

	    ev = window.event || ev;	    
	    remove_event(ev);
	    
	    // If the number of pointers down is less than two then reset diff tracker
	    if (me.evCache.length < 2) {
		me.prevDiff = -1;
	    }

	    /*
	    if (ev.preventDefault) {
		ev.preventDefault();
	    } else {
		ev.returnValue = false;
	    }
	    
	    return false;
	    */
	};
	
	container.addEventListener("pointerup", onpointerup);
	container.addEventListener("pointerdown", onpointerdown);
	container.addEventListener("pointermove", onpointermove);
	
	// container.addEventListener("pointercancel", onpointerup);
	// container.addEventListener("pointerleave", onpointerup);	    
	// container.addEventListener("pointerout", onpointerdown);	    
	
    };

    PanZoom.prototype = panZoomFunctions;    
    Raphael.fn.panzoom = {};

    Raphael.fn.panzoom = function (options) {
        var paper = this;
        return new PanZoom(paper, options);
    };

}());
