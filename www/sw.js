const cache_name = 'fingerprint-v1.0.0b14';
// Actual version number is set in index.html

const app_files = [
    // HTML
    "./index.html",
    
    // CSS
    "./css/bootstrap.5.3.8.min.css",
    "./css/fingerprint.css",
    "./css/toastify.1.12.0.min.css",
    
    // Javascript dependencies
    
    "./javascript/FileSaver.2.0.4.min.js",
    "./javascript/XmlBeautify.1.2.1.min.js",
    "./javascript/localforage.1.1.0.min.js",
    "./javascript/raphael.2.3.0.min.js",
    "./javascript/toastify.1.12.0.js",
    "./javascript/simplify.1.2.4.js",
    "./javascript/fit-curve.0.1.7.min.js",        

    "./javascript/sfomuseum.golang.wasm.bundle.js",
    "./javascript/offline.application.js",
    
    // Javascript application

    "./javascript/fingerprint.raphael.sketchpad-nojq.js",    
    "./javascript/fingerprint.application.js",
    "./javascript/fingerprint.capabilities.js",
    "./javascript/fingerprint.colours.js",
    "./javascript/fingerprint.exif.js",    
    "./javascript/fingerprint.controls.js",
    "./javascript/fingerprint.drawing.js",    
    "./javascript/fingerprint.export.js",
    "./javascript/fingerprint.feedback.js",
    "./javascript/fingerprint.import.js",        
    "./javascript/fingerprint.init.js",
    "./javascript/fingerprint.menu.js",
    "./javascript/fingerprint.render.js",
    "./javascript/fingerprint.share.js",
    "./javascript/fingerprint.storage.js",
    "./javascript/fingerprint.offline.js",    
    "./javascript/fingerprint.viewsource.js",

    // WASM

    "./wasm/update_exif.wasm",
    
    // Javascript service workers
    "./sw.js"    
];

self.addEventListener('message', (event) => {

    if (event.data && event.data.type === 'GET_CACHE_VERSION') {
	
	event.source.postMessage({
	    type: 'CACHE_VERSION',
	    value: cache_name,
	});
    }
});

self.addEventListener("install", (e) => {

    console.log("SW installed", cache_name);

    e.waitUntil((async () => {
	const cache = await caches.open(cache_name);
	// console.log('[Service Worker] Caching all: app shell and content');
	await cache.addAll(app_files);
    })());
});

addEventListener("activate", (event) => {
    console.log("SW activate", cache_name);
});

addEventListener("message", (event) => {
    // event is a MessageEvent object
    console.log(`The service worker sent me a message: ${event.data}`);
  });


self.addEventListener('fetch', (e) => {

    // https://developer.mozilla.org/en-US/docs/Web/API/Cache
    
    e.respondWith((async () => {

	console.log("fetch", cache_name, e.request.url);
	
	const cache = await caches.open(cache_name);
	const r = await cache.match(e.request);
	
	console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
	
	if (r) {
	    console.log("return cache", e.request.url);
	    return r;
	}
	
	const response = await fetch(e.request);
	
	console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
	cache.put(e.request, response.clone());
	
	return response;
    })());
    
});
