# https://getbootstrap.com/
BOOTSTRAP_VERSION=5.3.8

# https://github.com/DmitryBaranovskiy/raphael
RAPHAEL_JS_VERSION=2.3.0

# https://mourner.github.io/simplify-js/
SIMPLIFY_JS_VERSION=1.2.4

# https://github.com/localForage/localForage
LOCALFORAGE_JS_VERSION=1.1.0

# https://github.com/apvarun/toastify-js
TOASTIFY_JS_VERSION=1.12.0

# https://github.com/soswow/fit-curve
FITCURVE_JS_VERSION=0.1.7

# https://github.com/eligrey/FileSaver.js/
FILESAVER_JS_VERSION=2.0.4

# https://github.com/riversun/xml-beautify
XMLBEAUTIFY_JS_VERSION=1.2.1

FINGERPRINT_JS_VERSION=1.0.0

# https://github.com/tdewolff/minify#installation
MINIFY=minify

debug:
	fileserver -root www -mimetype .wasm=application/wasm

css:
	curl -o www/css/bootstrap.$(BOOTSTRAP_VERSION).min.css  https://cdn.jsdelivr.net/npm/bootstrap@$(BOOTSTRAP_VERSION)/dist/css/bootstrap.min.css

minify:
	$(MINIFY) -o www/javascript/fingerprint.$(FINGERPRINT_JS_VERSION).min.js -b \
		www/javascript/fingerprint.raphael.js \
		www/javascript/fingerprint.raphael.sketchpad.js \
		www/javascript/fingerprint.application.js \
		www/javascript/fingerprint.capabilities.js \
		www/javascript/fingerprint.colours.js \
		www/javascript/fingerprint.exif.js \
		www/javascript/fingerprint.controls.js \
		www/javascript/fingerprint.drawing.js \
		www/javascript/fingerprint.export.js \
		www/javascript/fingerprint.feedback.js \
		www/javascript/fingerprint.import.js \
		www/javascript/fingerprint.menu.js \
		www/javascript/fingerprint.render.js \
		www/javascript/fingerprint.share.js \
		www/javascript/fingerprint.storage.js \
		www/javascript/fingerprint.offline.js \
		www/javascript/fingerprint.viewsource.js

