const cache_name = 'fingerprint-v0.0.25';

const app_files = [
    // HTML
    "./index.html",
    
    // CSS
    "./css/bootstrap.min.css",
    "./css/fingerprint.css",
    "./css/toastify.min.css",
    
    // Javascript dependencies
    
    "./javascript/FileSaver.min.js",
    "./javascript/XmlBeautify.js",
    "./javascript/jquery-3.6.3.min.js",
    "./javascript/localforage.min.js",
    "./javascript/raphael.min.js",
    "./javascript/toastify.js",
    "./javascript/simplify.js",
    "./javascript/fit-curve.min.js",        
    "./javascript/wasm_exec.js",
    "./javascript/sfomuseum.wasm.js",
    
    // Javascript application

    "./javascript/fingerprint.raphael.sketchpad.js",    
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
    "./javascript/fingerprint.offline.js",
    "./javascript/fingerprint.render.js",
    "./javascript/fingerprint.share.js",
    "./javascript/fingerprint.storage.js",
    "./javascript/fingerprint.viewsource.js",

    // WASM

    "./wasm/update_exif.wasm",
    
    // Javascript service workers
    "./sw.js"    
];

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
