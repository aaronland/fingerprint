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

debug:
	fileserver -root www -mimetype .wasm=application/wasm

css:
	curl -o www/css/bootstrap.$(BOOTSTRAP_VERSION).min.css  https://cdn.jsdelivr.net/npm/bootstrap@$(BOOTSTRAP_VERSION)/dist/css/bootstrap.min.css
