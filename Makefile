BOOTSTRAP_VERSION=5.3.8

debug:
	fileserver -root www -mimetype .wasm=application/wasm

css:
	curl -o www/css/bootstrap.$(BOOTSTRAP_VERSION).min.css  https://cdn.jsdelivr.net/npm/bootstrap@$(BOOTSTRAP_VERSION)/dist/css/bootstrap.min.css
