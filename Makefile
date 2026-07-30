#
BOOTSTRAP_VERSION=5.3.8

# https://github.com/DmitryBaranovskiy/raphael
RAPHAEL_JS_VERSION=2.3.0

#
SIMPLIFY_JS_VERSION=1.2.4

# https://github.com/localForage/localForage
LOCALFORAGE_JS_VERSION=1.1.0

#
TOASTIFY_JS_VERSION=1.12.0

debug:
	fileserver -root www -mimetype .wasm=application/wasm

css:
	curl -o www/css/bootstrap.$(BOOTSTRAP_VERSION).min.css  https://cdn.jsdelivr.net/npm/bootstrap@$(BOOTSTRAP_VERSION)/dist/css/bootstrap.min.css
