// fingerprint.application.js
// --------------------------
// This module contains the top‑level application logic for the
// Fingerprint application. It wires up capabilities, colours, drawing,
// storage, clipboard support, and online/offline event handling
// to initialise the UI and behaviour on page load.

var fingerprint = fingerprint || {};

/**
 * Main application module.
 *
 * @namespace fingerprint.application
 * @memberof fingerprint
 */
fingerprint.application = (function(){

    /**
     * Public API of the application.
     *
     * @typedef {Object} App
     * @property {Object|null} sketchpad  Reference to the SketchPad instance.
     * @property {Object|null} panzoom   Reference to a pan‑zoom controller.
     * @property {Function} init  Initialise the application.
     */

    var self = {

        /** @type {Object|null} Reference to the SketchPad instance. */
        sketchpad: null,

        /** @type {Object|null} Reference to a pan‑zoom controller. */
        panzoom: null,

        /**
         * Initialises the application.  This method is called once the
         * page has loaded.  It performs the following steps:
         *
         * 1.  Detects browser capabilities.
         * 2.  Assigns a default colour to the drawing tools.
         * 3.  Creates a fresh drawing canvas.
         * 4.  Sets up the storage UI (list icon, autosave).
         * 5.  Enables the "copy source to clipboard" button if supported.
         * 6.  Registers listeners for online/offline events to show/hide
         *     the appropriate UI controls.
         * 7.  Checks the `data-offline-scope` attribute on the body; if
         *     present, initialises offline‑storage support and shows
         *     the settings menu.
         *
         * @returns {void}
         */
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

            var offline_scope = document.body.getAttribute("data-offline-scope");

            // For the time being this check is enough to determine whether
            // or not to show the settings menu control. Some day if there
            // are other settings this will need to be revisited.
            
            if (offline_scope){
		
                offline.application.init(offline_scope);
                fingerprint.menu.show_settings_control();
		
		if (navigator.serviceWorker.controller){

		    navigator.serviceWorker.controller.postMessage({
			type: 'GET_CACHE_VERSION',
		    });

		    navigator.serviceWorker.addEventListener('message', (event) => {
			
			console.debug("SW MESSAGE RECEIVED", event);
			
			if (event.data && event.data.type === 'CACHE_VERSION'){

			    try {
				const version_el = document.querySelector("#settings-version-sw");
				version_el.innerText = " (service worker " + event.data.value + ")";
			    } catch {
				console.error("Failed to assign SW version", err);
			    }
			    
			}
		    });
		} else {
		    console.warn('No Service Worker controlling this page, unable to determine SW version.');
		}
            }
        },

    };

    return self;

})();
