// https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event
// https://mdn.github.io/dom-examples/pointerevents/Pinch_zoom_gestures.html

// Log events flag
var logEvents = false;

// Global vars to cache event state
var evCache = new Array();
var prevDiff = -1;

// Logging/debugging functions
function enableLog(ev) {
    logEvents = logEvents ? false : true;
}

function log(prefix, ev) {
    if (!logEvents) return;
    var o = document.getElementsByTagName('output')[0];
    var s = prefix + ": pointerID = " + ev.pointerId +
            " ; pointerType = " + ev.pointerType +
            " ; isPrimary = " + ev.isPrimary;
    o.innerHTML += s + " <br>";
} 

function clearLog(event) {
    var o = document.getElementsByTagName('output')[0];
    o.innerHTML = "";
}

function pointerdown_handler(ev) {
    // The pointerdown event signals the start of a touch interaction.
    // This event is cached to support 2-finger gestures
    evCache.push(ev);
    log("pointerDown", ev);
}

function pointermove_handler(ev) {
    // This function implements a 2-pointer horizontal pinch/zoom gesture. 
    //
    // If the distance between the two pointers has increased (zoom in), 
    // the taget element's background is changed to "pink" and if the 
    // distance is decreasing (zoom out), the color is changed to "lightblue".
    //
    // This function sets the target element's border to "dashed" to visually
    // indicate the pointer's target received a move event.
    log("pointerMove", ev);
    ev.target.style.border = "dashed";
    
    // Find this event in the cache and update its record with this event
    for (var i = 0; i < evCache.length; i++) {
	if (ev.pointerId == evCache[i].pointerId) {
	    evCache[i] = ev;
	    break;
	}
    }
    
    // If two pointers are down, check for pinch gestures
    if (evCache.length == 2) {
	// Calculate the distance between the two pointers
	var curDiff = Math.sqrt(Math.pow(evCache[1].clientX - evCache[0].clientX, 2) + Math.pow(evCache[1].clientY - evCache[0].clientY, 2));
	
	if (prevDiff > 0) {
	    if (curDiff > prevDiff) {
		// The distance between the two pointers has increased
		log("Pinch moving OUT -> Zoom in", ev);
		ev.target.style.background = "pink";
	    }
	    if (curDiff < prevDiff) {
		// The distance between the two pointers has decreased
		log("Pinch moving IN -> Zoom out",ev);
		ev.target.style.background = "lightblue";
	    }
	}
	
	// Cache the distance for the next move event 
	prevDiff = curDiff;
    }
}

function wheel_handler(ev){

    let scale = 1.0
    ev.preventDefault();

    if (ev.deltaY > 0){
	console.log("zoom in");
	ev.target.style.background = "pink";	
    } else if (ev.deltaY < 0){
	console.log("zoom out");
	ev.target.style.background = "lightblue";		
    }

    if (ev.deltaX > 0 ){
	console.log("pan left");
    } else if (ev.deltaX < 0) {
	console.log("pane right");
    }
    
    console.log("Y", ev.deltaY);
    console.log("X", ev.deltaX);    
    return;
    
    scale += ev.deltaY * -0.01;
    
    // Restrict scale
    scale = Math.min(Math.max(0.125, scale), 4);
    
    // Apply scale transform
    ev.target.style.transform = `scale(${scale})`;
}

function pointerup_handler(ev) {
    log(ev.type, ev);
    // Remove this pointer from the cache and reset the target's
    // background and border
    remove_event(ev);
    ev.target.style.background = "white";
    ev.target.style.border = "1px solid black";
    
    // If the number of pointers down is less than two then reset diff tracker
    if (evCache.length < 2) prevDiff = -1;
}

function remove_event(ev) {
    // Remove this event from the target's cache
    for (var i = 0; i < evCache.length; i++) {
	if (evCache[i].pointerId == ev.pointerId) {
	    evCache.splice(i, 1);
	    break;
	}
    }
}

function init() {
    // Install event handlers for the pointer target
    var el=document.getElementById("target");
    el.onpointerdown = pointerdown_handler;
    el.onpointermove = pointermove_handler;
    
    // Use same handler for pointer{up,cancel,out,leave} events since
    // the semantics for these events - in this app - are the same.
    el.onpointerup = pointerup_handler;
    el.onpointercancel = pointerup_handler;
    el.onpointerout = pointerup_handler;
    el.onpointerleave = pointerup_handler;

    el.onwheel = wheel_handler;
}

