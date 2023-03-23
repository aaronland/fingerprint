# fingerprint

None of the other digital drawing tools were my jam, so I wrote my own. It's called `fingerprint`.

## Description

`fingerprint` is an opionated vector drawing application built Dimitry Baranovskiy's [raphael.js](https://github.com/DmitryBaranovskiy/raphael) and a modified version of Ian Li's [raphael-sketchpad](https://github.com/ianli/raphael-sketchpad/).

It is a single-page HTML5 web application for drawing closed paths (technically strokes that automatically close themselves) filled with a single colour (and opacity). The application has the ability to "undo" and "redo" individual paths as well the ability to remove individual paths by clicking on them (but I almost never use the feature). That's all it does, by design.

Individual drawings can be exported as PNG, SVG and JSON files on devices that support the [File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API). Drawings, stored in the SVG format, can be re-imported in to the application (assuming support for the `File` API). They can also be "shared" (as PNG and SVG documents) on devices that support the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API). There is also support for saving and loading individual drawings to the browser's local cache.

The application is designed to work offline for devices that support the [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). This works but should probably still be considered unstable. Support, or at least documentation, for Service Workers across platforms is inconsistent and they appear to be causing problems with the local caching functionality.

The goal for the application is to develop the ability to:

* Zoom in and out of an SVG canvas.
* Enlarge (or shrink) the SVG canvas, redrawing the current image in the center of the (new) canvas.
* Smoothing of paths using Bezier curves, or a functional equivalent.

Suggestions, or contributions, on how to implement any of these features is welcomed.

## Features

### Local storage

### Import and Export

### Sharing

### Offline support

## See also

### JavaScript

* https://github.com/DmitryBaranovskiy/raphael
* https://github.com/ianli/raphael-sketchpad/
* https://github.com/eligrey/FileSaver.js/ 
* https://github.com/apvarun/toastify-js
* https://github.com/localForage/localForage

### HTML 5

* https://developer.mozilla.org/en-US/docs/Web/API/File_API
* https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
* https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

### Graphic design

* https://icons.getbootstrap.com/