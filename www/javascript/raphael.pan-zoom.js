/**
 * raphael.pan-zoom plugin 0.2.1
 * Copyright (c) 2012 @author Juan S. Escobar
 * https://github.com/escobar5
 *
 * licensed under the MIT license
 */
 
(function () {
    'use strict';
    /*jslint browser: true*/
    /*global Raphael*/
    
    function findPos(obj) {
        var posX = obj.offsetLeft, posY = obj.offsetTop, posArray;
        while (obj.offsetParent) {
            if (obj === document.getElementsByTagName('body')[0]) {
                break;
            } else {
                posX = posX + obj.offsetParent.offsetLeft;
                posY = posY + obj.offsetParent.offsetTop;
                obj = obj.offsetParent;
            }
        }
        posArray = [posX, posY];
        return posArray;
    }
    
    function getRelativePosition(e, obj) {
        var x, y, pos;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        pos = findPos(obj);
        x -= pos[0];
        y -= pos[1];

        return { x: x, y: y };
    }

    var panZoomFunctions = {
        enable: function () {
            this.enabled = true;
        },

        disable: function () {
            this.enabled = false;
        },

        zoomIn: function (steps) {
            this.applyZoom(steps);
        },

        zoomOut: function (steps) {
            this.applyZoom(steps > 0 ? steps * -1 : steps);
        },

        pan: function (deltaX, deltaY) {
            this.applyPan(deltaX * -1, deltaY * -1);
        },

        isDragging: function () {
            return this.dragTime > this.dragThreshold;
        },

        getCurrentPosition: function () {
            return this.currPos;
        },

        getCurrentZoom: function () {
            return this.currZoom;
        }
    },

        PanZoom = function (el, options) {
            var paper = el,
                container = paper.canvas.parentNode,
                me = this,
                settings = {},
                initialPos = { x: 0, y: 0 },
                deltaX = 0,
                deltaY = 0;
	    
	    // Global vars to cache event state
	    this.evCache = new Array();
	    this.prevDiff = -1;
	    
            this.enabled = false;
            this.dragThreshold = 5;
            this.dragTime = 0;
    
            options = options || {};
    
            settings.maxZoom = options.maxZoom || 9;
            settings.minZoom = options.minZoom || 0;
            settings.zoomStep = options.zoomStep || 0.1;
            settings.initialZoom = options.initialZoom || 0;
            settings.initialPosition = options.initialPosition || { x: 0, y: 0 };
    
            this.currZoom = settings.initialZoom;
            this.currPos = settings.initialPosition;
            
            function repaint() {
                me.currPos.x = me.currPos.x + deltaX;
                me.currPos.y = me.currPos.y + deltaY;
    
                var newWidth = paper.width * (1 - (me.currZoom * settings.zoomStep)),
                    newHeight = paper.height * (1 - (me.currZoom * settings.zoomStep));
    
                if (me.currPos.x < 0) {
                    me.currPos.x = 0;
                } else if (me.currPos.x > (paper.width * me.currZoom * settings.zoomStep)) {
                    me.currPos.x = (paper.width * me.currZoom * settings.zoomStep);
                }
    
                if (me.currPos.y < 0) {
                    me.currPos.y = 0;
                } else if (me.currPos.y > (paper.height * me.currZoom * settings.zoomStep)) {
                    me.currPos.y = (paper.height * me.currZoom * settings.zoomStep);
                }
                paper.setViewBox(me.currPos.x, me.currPos.y, newWidth, newHeight);
            }
            
            function dragging(e) {
                if (!me.enabled) {
                    return false;
                }
                var evt = window.event || e,
                    newWidth = paper.width * (1 - (me.currZoom * settings.zoomStep)),
                    newHeight = paper.height * (1 - (me.currZoom * settings.zoomStep)),
                    newPoint = getRelativePosition(evt, container);
    
                deltaX = (newWidth * (newPoint.x - initialPos.x) / paper.width) * -1;
                deltaY = (newHeight * (newPoint.y - initialPos.y) / paper.height) * -1;
                initialPos = newPoint;
    
                repaint();
                me.dragTime += 1;
                if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                return false;
            }
            
            function applyZoom(val, centerPoint) {
                if (!me.enabled) {
                    return false;
                }
                me.currZoom += val;
                if (me.currZoom < settings.minZoom) {
                    me.currZoom = settings.minZoom;
                } else if (me.currZoom > settings.maxZoom) {
                    me.currZoom = settings.maxZoom;
                } else {
                    centerPoint = centerPoint || { x: paper.width / 2, y: paper.height / 2 };
    
                    deltaX = ((paper.width * settings.zoomStep) * (centerPoint.x / paper.width)) * val;
                    deltaY = (paper.height * settings.zoomStep) * (centerPoint.y / paper.height) * val;
    
                    repaint();
                }
            }
    
            this.applyZoom = applyZoom;
            
            function handleScroll(e) {
                if (!me.enabled) {
                    return false;
                }
                var evt = window.event || e,
                    delta = evt.detail || evt.wheelDelta * -1,
                    zoomCenter = getRelativePosition(evt, container);
    
                if (delta > 0) {
                    delta = -1;
                } else if (delta < 0) {
                    delta = 1;
                }
                
                applyZoom(delta, zoomCenter);
                if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                return false;
            }
            
            repaint();

	    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures

	    var onpointermove = function(ev){

		// Find this event in the cache and update its record with this event
		for (var i = 0; i < this.evCache.length; i++) {
		    if (ev.pointerId == this.evCache[i].pointerId) {
			this.evCache[i] = ev;
			break;
		    }
		}
		
		// If two pointers are down, check for pinch gestures
		if (this.evCache.length == 2) {
		    // Calculate the distance between the two pointers
		    var curDiff = Math.sqrt(Math.pow(this.evCache[1].clientX - this.evCache[0].clientX, 2) + Math.pow(this.evCache[1].clientY - this.evCache[0].clientY, 2));
		    
		    if (this.prevDiff > 0) {
			if (curDiff > this.prevDiff) {
			    // The distance between the two pointers has increased
			    ev.target.style.background = "pink";
			}
			if (curDiff < this.prevDiff) {
			    // The distance between the two pointers has decreased
			    ev.target.style.background = "lightblue";
			}
		    }
		    
		    // Cache the distance for the next move event 
		    this.prevDiff = curDiff;
		}
		
	    };
	    
	    var onpointerdown = function(e) {

                var evt = window.event || e;

                if (!me.enabled) {
                    return false;
                }

		this.evCache.push(evt);
		
		me.dragTime = 0;
		initialPos = getRelativePosition(evt, container);
		container.className += " grabbing";
		// container.onpointermove = dragging;
		// document.onpointeremove = function () { return false; };

		container.addEventListener("onpointermove", dragging);
		
		if (evt.preventDefault) {
		    evt.preventDefault();
		} else {
		    evt.returnValue = false;
		}
		
                return false;
		
	    };

	    var onpointerup = function(ev){

		remove_event(ev);
		
		// If the number of pointers down is less than two then reset diff tracker
		if (this.evCache.length < 2) {
		    this.prevDiff = -1;
		}
		
		console.log("UP", e.pointerType);
		console.log("UP", me.enabled);		
		//Remove class framework independent
		// document.onpointermove = null;
		container.className = container.className.replace(/(?:^|\s)grabbing(?!\S)/g, '');
		// container.onpointermove = null;

		container.removeEventListener("onpointermove", dragging);
	    };
		
	    // container.onpointerdown = onpointerdown;
            // container.onpointerup = onpointerup;

	    container.addEventListener("onpointerdown", onpointerdown);
	    container.addEventListener("onpointerup", onpointerup);	    
	    
            container.addEventListener("wheel", handleScroll, false);

	    function remove_event(ev) {
		// Remove this event from the target's cache
		for (var i = 0; i < this.evCache.length; i++) {
		    if (this.evCache[i].pointerId == ev.pointerId) {
			this.evCache.splice(i, 1);
			break;
		    }
		}
	    }
	    
            function applyPan(dX, dY) {
                deltaX = dX;
                deltaY = dY;
                repaint();
            }
            
            this.applyPan = applyPan;
        };

    PanZoom.prototype = panZoomFunctions;

    Raphael.fn.panzoom = {};

    Raphael.fn.panzoom = function (options) {
        var paper = this;
        return new PanZoom(paper, options);
    };

}());
