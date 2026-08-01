/* fingerprint.raphael.sketchpad.js – jQuery‑free version   
 *
 * 0.5.1 – Updated to use native JavaScript only.
 *  Touch events are now fully supported on mobile browsers.
 *
 *  Original code:  https://github.com/ianli/raphael-sketchpad
 *  Adapted by:     https://github.com/aaronland/fingerprint
 */

;(function (Raphael) {

    /* -----------------------------------------------------------------
       Public API
       ----------------------------------------------------------------- */

    /**
     * Creates a new sketchpad on a Raphael paper.
     *
     * @param {Raphael.Paper|String|Array} paper  The Raphael paper to draw on,
     *        an element ID string, or an array with 3 elements
     *        (`[id, width, height]`).
     * @param {Object} [options]  Optional configuration object.
     * @returns {SketchPad} The created sketchpad instance.
     */
    Raphael.sketchpad = function (paper, options) {
        return new SketchPad(paper, options);
    };

    // Current version
    Raphael.sketchpad.VERSION = '0.5.1';

    /* -----------------------------------------------------------------
       SketchPad implementation
       ----------------------------------------------------------------- */

    /**
     * SketchPad constructor.  Handles drawing, editing, history,
     * serialization, and animation of strokes.
     *
     * @class
     * @param {Raphael.Paper|String|Array} paper  The Raphael paper to draw on,
     *        an element ID string, or an array with 3 elements.
     * @param {Object} [options]  Optional configuration object.
     * @param {number} [options.width=100]  Width of the canvas.
     * @param {number} [options.height=100] Height of the canvas.
     * @param {Array}  [options.strokes=[]] Initial strokes to load.
     * @param {boolean|string} [options.editing=true] Editing mode: `true`,
     *        `"erase"` or `false`.
     */
    var SketchPad = function (paper, options) {
        var self = this;

        /* Default options */
        var _options = {
            width: 100,
            height: 100,
            strokes: [],
            editing: true
        };
        Object.assign(_options, options);

        /* The Raphael context to draw on */
        var _paper;
        if (paper.raphael && paper.raphael.constructor === Raphael.constructor) {
            _paper = paper;
        } else if (typeof paper === "string") {
            _paper = Raphael(paper, _options.width, _options.height);
        } else {
            throw "first argument must be a Raphael object, an element ID, or an array with 3 elements";
        }

        /* The Raphael SVG canvas */
        var _canvas = _paper.canvas;

        /* The HTML element that contains the canvas */
        var _container = _canvas.parentNode;   // pure DOM

        /* The default pen */
        var _pen = new Pen();

        /* -----------------------------------------------------------------
           Public Methods
           ----------------------------------------------------------------- */

        /**
         * Returns the underlying Raphael paper.
         *
         * @returns {Raphael.Paper}
         */
        self.paper = function () { return _paper; };

        /**
         * Returns the SVG canvas element.
         *
         * @returns {HTMLElement}
         */
        self.canvas = function () { return _canvas; };

        /**
         * Returns the container element that holds the canvas.
         *
         * @returns {HTMLElement}
         */
        self.container = function () { return _container; };

        /**
         * Gets or sets the current pen.
         *
         * @param {Pen} [value]  The pen to use.
         * @returns {Pen|SketchPad}  The current pen or the sketchpad instance for chaining.
         */
        self.pen = function (value) {
            if (value === undefined) { return _pen; }
            _pen = value;
            return self;
        };

        /* Convert an SVG path into a string, so that it's smaller when JSONified. */
        function svg_path_to_string(path) {
            var str = "";
            for (var i = 0, n = path.length; i < n; i++) {
                var point = path[i];
                var lead = point.shift();   // remove the command (M/L/C)
                str += lead + point.join(",");
            }
            return str;
        }

        /* Convert a string into an SVG path. */
        function string_to_svg_path(str) {
            var path = [];
            var tokens = str.split("L");

            if (tokens.length > 0) {
                var token = tokens[0].replace("M", "");
                var points = token.split(",");

                path.push(["M", parseInt(points[0]), parseInt(points[1])]);

                for (var i = 1, n = tokens.length; i < n; i++) {
                    token = tokens[i];
                    points = token.split(",");
                    path.push(["L", parseInt(points[0]), parseInt(points[1])]);
                }
            }
            return path;
        }

        /**
         * Serializes or deserializes the sketchpad to/from JSON.
         *
         * @param {string} [value]  If provided, deserializes the given JSON string.
         * @returns {string|SketchPad}  JSON string or the sketchpad instance for chaining.
         */
        self.json = function (value) {
            if (value === undefined) {
                for (var i = 0, n = _strokes.length; i < n; i++) {
                    var stroke = _strokes[i];
                    if (typeof stroke.path === "object") {
                        stroke.path = svg_path_to_string(stroke.path);
                    }
                }
                return JSON.stringify(_strokes);
            }
            return self.strokes(JSON.parse(value));
        };

        /* Stroke handling */
        /**
         * Gets or sets the strokes array.
         *
         * @param {Array} [value]  If provided, sets the strokes to this array.
         * @returns {Array|SketchPad}  The current strokes array or the sketchpad instance.
         */
        self.strokes = function (value) {
            if (value === undefined) { return _strokes; }
            if (Array.isArray(value)) {
                _strokes = value;

                for (var i = 0, n = _strokes.length; i < n; i++) {
                    var stroke = _strokes[i];
                    if (typeof stroke.path === "string") {
                        stroke.path = string_to_svg_path(stroke.path);
                    }
                }

                _action_history.add({
                    type: "batch",
                    strokes: _strokes.slice()   // shallow copy
                });

                _redraw_strokes();
                _fire_change();
            }
            return self;
        };

        /* History */
        /**
         * Freezes the history at the current state (or at the specified index).
         *
         * @param {number} [index]  Optional index to freeze at.
         * @returns {SketchPad}
         */
        self.freeze_history = function () { _action_history.freeze(); };

        /**
         * Indicates whether an undo operation is possible.
         *
         * @returns {boolean}
         */
        self.undoable = function () { return _action_history.undoable(); };

        /**
         * Undoes the last action if possible.
         *
         * @returns {SketchPad}
         */
        self.undo = function () {
            if (_action_history.undoable()) {
                _action_history.undo();
                _strokes = _action_history.current_strokes();
                _redraw_strokes();
                _fire_change();
            }
            return self;
        };

        /**
         * Indicates whether a redo operation is possible.
         *
         * @returns {boolean}
         */
        self.redoable = function () { return _action_history.redoable(); };

        /**
         * Redoes the last undone action if possible.
         *
         * @returns {SketchPad}
         */
        self.redo = function () {
            if (self.redoable()) {
                _action_history.redo();
                _strokes = _action_history.current_strokes();
                _redraw_strokes();
                _fire_change();
            }
            return self;
        };

        /**
         * Clears all strokes from the sketchpad.
         *
         * @returns {SketchPad}
         */
        self.clear = function () {
            _action_history.add({ type: "clear" });
            _strokes = [];
            _redraw_strokes();
            _fire_change();
            return self;
        };

        /* Animate strokes */
        /**
         * Animates the drawing of all strokes over the given time interval.
         *
         * @param {number} [ms=500]  Milliseconds between drawing each stroke.
         * @returns {SketchPad}
         */
        self.animate = function (ms) {
            ms = ms === undefined ? 500 : ms;
            _paper.clear();

            if (_strokes.length > 0) {
                var i = 0;
                (function animate() {
                    var stroke = _strokes[i];
                    var type = stroke.type;
                    _paper[type]().attr(stroke).click(_pathclick);
                    i++;
                    if (i < _strokes.length) {
                        setTimeout(animate, ms);
                    }
                })();
            }
            return self;
        };

        /* Editing mode (draw / erase / view) */
        /**
         * Sets or gets the editing mode.
         *
         * @param {boolean|string} [mode]  If provided, sets the mode.
         *        `true`/`false` enable/disable editing, `"erase"` activates eraser.
         * @returns {boolean|string|SketchPad}  Current mode or the sketchpad instance.
         */
        self.editing = function (mode) {
            if (mode === undefined) { return _options.editing; }
            _options.editing = mode;

            if (_options.editing) {
                if (_options.editing === "erase") {
                    _container.style.cursor = "crosshair";
                    _container.removeEventListener("mousedown", _mousedown);
                    _container.removeEventListener("mousemove", _mousemove);
                    _container.removeEventListener("mouseup", _mouseup);
                    document.removeEventListener("mouseup", _mouseup);

                    // iPhone/iPad events
                    _container.removeEventListener("touchstart", _touchstart);
                    _container.removeEventListener("touchmove", _touchmove);
                    _container.removeEventListener("touchend", _touchend);
                } else {
                    _container.style.cursor = "crosshair";
                    _container.addEventListener("mousedown", _mousedown);
                    _container.addEventListener("mousemove", _mousemove);
                    _container.addEventListener("mouseup", _mouseup);
                    document.addEventListener("mouseup", _mouseup);

                    // iPhone/iPad events
                    _container.addEventListener("touchstart", _touchstart, { passive: false });
                    _container.addEventListener("touchmove", _touchmove, { passive: false });
                    _container.addEventListener("touchend", _touchend, { passive: false });
                }
            } else {
                _container.style.cursor = "default";
                _container.removeEventListener("mousedown", _mousedown);
                _container.removeEventListener("mousemove", _mousemove);
                _container.removeEventListener("mouseup", _mouseup);
                document.removeEventListener("mouseup", _mouseup);

                // iPhone/iPad events
                _container.removeEventListener("touchstart", _touchstart);
                _container.removeEventListener("touchmove", _touchmove);
                _container.removeEventListener("touchend", _touchend);
            }

            return self;
        };

        /* -----------------------------------------------------------------
           Change events
           ----------------------------------------------------------------- */

        /**
         * Registers a callback that is invoked whenever the sketchpad changes.
         *
         * @param {Function|null|undefined} fn  The callback function.
         *        If omitted or null, removes any existing callback.
         * @returns {void}
         */
        var _change_fn = function () {};
        self.change = function (fn) {
            if (fn == null || fn === undefined) {
                _change_fn = function () {};
            } else if (typeof fn === "function") {
                _change_fn = fn;
            }
        };
        function _fire_change() { _change_fn(); }

        /* -----------------------------------------------------------------
           Miscellaneous methods
           ----------------------------------------------------------------- */

        /**
         * Redraws all strokes onto the paper.
         *
         * @private
         * @returns {void}
         */
        function _redraw_strokes() {
            _paper.clear();
            for (var i = 0, n = _strokes.length; i < n; i++) {
                var stroke = _strokes[i];
                var type = stroke.type;
                _paper[type]().attr(stroke).click(_pathclick);
            }
        }

        /**
         * Disables text selection on all elements in the document.
         *
         * @private
         * @returns {void}
         */
        function _disable_user_select() {
            var elems = document.querySelectorAll('*');
            for (var i = 0; i < elems.length; i++) {
                elems[i].style.webkitUserSelect = 'none';
                elems[i].style.MozUserSelect = 'none';
            }
        }

        /**
         * Enables text selection on all elements in the document.
         *
         * @private
         * @returns {void}
         */
        function _enable_user_select() {
            var elems = document.querySelectorAll('*');
            for (var i = 0; i < elems.length; i++) {
                elems[i].style.webkitUserSelect = 'text';
                elems[i].style.MozUserSelect = 'text';
            }
        }

        /* -----------------------------------------------------------------
           Event handlers
           ----------------------------------------------------------------- */

        /**
         * Handles click events on strokes when in eraser mode.
         *
         * @private
         * @param {MouseEvent} e  The click event.
         * @returns {void}
         */
        function _pathclick(e) {
            if (_options.editing === "erase") {
                var stroke = this.attr();
                stroke.type = this.type;

                _action_history.add({
                    type: "erase",
                    stroke: stroke
                });

                for (var i = 0, n = _strokes.length; i < n; i++) {
                    var s = _strokes[i];
                    if (equiv(s, stroke)) {
                        _strokes.splice(i, 1);
                    }
                }

                _fire_change();
                this.remove();
            }
        }

        /**
         * Handles mousedown events to start a new stroke.
         *
         * @private
         * @param {MouseEvent} e  The mousedown event.
         * @returns {void}
         */
        function _mousedown(e) {
            _disable_user_select();
            _pen.start(e, self);
        }

        /**
         * Handles mousemove events to continue a stroke.
         *
         * @private
         * @param {MouseEvent} e  The mousemove event.
         * @returns {void}
         */
        function _mousemove(e) {
            _pen.move(e, self);
        }

        /**
         * Handles mouseup events to finish a stroke.
         *
         * @private
         * @param {MouseEvent} e  The mouseup event.
         * @returns {void}
         */
        function _mouseup(e) {
            _enable_user_select();
            var path = _pen.finish(e, self);

            if (path != null) {
                path.click(_pathclick);
                var stroke = path.attr();
                stroke.type = path.type;
                _strokes.push(stroke);
                _action_history.add({
                    type: "stroke",
                    stroke: stroke
                });
                _fire_change();
            }
        }

        /* Touch helpers – convert touch to synthetic mouse event */
        /**
         * Handles touchstart events, converting them to a synthetic mouse event.
         *
         * @private
         * @param {TouchEvent} e  The touchstart event.
         * @returns {void}
         */
        function _touchstart(e) {
            e.preventDefault();
            if (e.touches.length === 1) {
                var touch = e.touches[0];
                var synthetic = {
                    pageX: touch.pageX !== undefined ? touch.pageX : touch.clientX + window.pageXOffset,
                    pageY: touch.pageY !== undefined ? touch.pageY : touch.clientY + window.pageYOffset
                };
                _mousedown(synthetic);
            }
        }

        /**
         * Handles touchmove events, converting them to a synthetic mouse event.
         *
         * @private
         * @param {TouchEvent} e  The touchmove event.
         * @returns {void}
         */
        function _touchmove(e) {
            e.preventDefault();
            if (e.touches.length === 1) {
                var touch = e.touches[0];
                var synthetic = {
                    pageX: touch.pageX !== undefined ? touch.pageX : touch.clientX + window.pageXOffset,
                    pageY: touch.pageY !== undefined ? touch.pageY : touch.clientY + window.pageYOffset
                };
                _mousemove(synthetic);
            }
        }

        /**
         * Handles touchend events, converting them to a synthetic mouse event.
         *
         * @private
         * @param {TouchEvent} e  The touchend event.
         * @returns {void}
         */
        function _touchend(e) {
            e.preventDefault();
            _mouseup(e);
        }

        /* -----------------------------------------------------------------
           Setup
           ----------------------------------------------------------------- */

        var _action_history = new ActionHistory();

        // Path data
        var _strokes = _options.strokes;
        if (Array.isArray(_strokes) && _strokes.length > 0) {
            _action_history.add({
                type: "init",
                strokes: _strokes.slice()
            });
            _redraw_strokes();
        } else {
            _strokes = [];
            _redraw_strokes();
        }

        self.editing(_options.editing);
    };

    /* -----------------------------------------------------------------
       ActionHistory implementation
       ----------------------------------------------------------------- */

    /**
     * ActionHistory keeps a stack of user actions to enable undo/redo.
     *
     * @class
     */
    var ActionHistory = function () {
        var self = this;
        var _history = [];
        var _current_state = -1;
        var _freeze_state = -1;
        var _current_strokes = null;

        /**
         * Adds a new action to the history stack.
         *
         * @param {Object} action  An object describing the action.
         * @returns {void}
         */
        self.add = function (action) {
            if (_current_state + 1 < _history.length) {
                _history.splice(_current_state + 1);
            }
            _history.push(action);
            _current_state = _history.length - 1;
            _current_strokes = null;
        };

        /**
         * Freezes the history at the current state or a specific index.
         *
         * @param {number} [index]  Optional index to freeze at.
         * @returns {void}
         */
        self.freeze = function (index) {
            _freeze_state = (index === undefined) ? _current_state : index;
        };

        /**
         * Determines if an undo operation is available.
         *
         * @returns {boolean}
         */
        self.undoable = function () {
            return _current_state > -1 && _current_state > _freeze_state;
        };

        /**
         * Performs an undo operation if possible.
         *
         * @returns {void}
         */
        self.undo = function () {
            if (self.undoable()) {
                _current_state--;
                _current_strokes = null;
            }
        };

        /**
         * Determines if a redo operation is available.
         *
         * @returns {boolean}
         */
        self.redoable = function () {
            return _current_state < _history.length - 1;
        };

        /**
         * Performs a redo operation if possible.
         *
         * @returns {void}
         */
        self.redo = function () {
            if (self.redoable()) {
                _current_state++;
                _current_strokes = null;
            }
        };

        /**
         * Computes the strokes that represent the current state.
         *
         * @returns {Array}  Array of stroke objects.
         */
        self.current_strokes = function () {
            if (_current_strokes == null) {
                var strokes = [];
                for (var i = 0; i <= _current_state; i++) {
                    var action = _history[i];
                    switch (action.type) {
                        case "init":
                        case "json":
                        case "strokes":
                        case "batch":
                            strokes = strokes.concat(action.strokes);
                            break;
                        case "stroke":
                            strokes.push(action.stroke);
                            break;
                        case "erase":
                            for (var s = 0, n = strokes.length; s < n; s++) {
                                var stroke = strokes[s];
                                if (equiv(stroke, action.stroke)) {
                                    strokes.splice(s, 1);
                                }
                            }
                            break;
                        case "clear":
                            strokes = [];
                            break;
                    }
                }
                _current_strokes = strokes;
            }
            return _current_strokes;
        };
    };

    /* -----------------------------------------------------------------
       Pen implementation
       ----------------------------------------------------------------- */

    /**
     * Pen represents the drawing tool used by SketchPad.
     *
     * @class
     */
    var Pen = function () {
        var self = this;
        var _color = "#000000";
        var _opacity = 1.0;
        var _width = 5;
        var _offset = null;

        // Drawing state
        var _drawing = false;
        var _c = null;
        var _points = [];

        var _curvy = false;
        var _curvy_tolerance = 3;    // simplify.js tolerance
        var _curvy_error = 50;       // fitcurve.js error

        /**
         * Enables or disables curve smoothing for the pen.
         *
         * @param {boolean} [value]  If provided, sets curve mode.
         * @returns {boolean|Pen}  Current curve mode or the pen instance.
         */
        self.curves = function (value) {
            if (value === undefined) { return _curvy; }
            _curvy = !!value;
        };

        /**
         * Gets or sets the pen color.
         *
         * @param {string} [value]  If provided, sets the pen color.
         * @returns {string|Pen}  Current color or the pen instance.
         */
        self.color = function (value) {
            if (value === undefined) { return _color; }
            _color = value;
            return self;
        };

        /**
         * Gets or sets the pen width.
         *
         * @param {number} [value]  If provided, sets the pen width.
         * @returns {number|Pen}  Current width or the pen instance.
         */
        self.width = function (value) {
            if (value === undefined) { return _width; }
            if (value < Pen.MIN_WIDTH) { value = Pen.MIN_WIDTH; }
            else if (value > Pen.MAX_WIDTH) { value = Pen.MAX_WIDTH; }
            _width = value;
            return self;
        };

        /**
         * Gets or sets the pen opacity.
         *
         * @param {number} [value]  If provided, sets the opacity (0–1).
         * @returns {number|Pen}  Current opacity or the pen instance.
         */
        self.opacity = function (value) {
            if (value === undefined) { return _opacity; }
            if (value < 0) { value = 0; }
            else if (value > 1) { value = 1; }
            _opacity = value;
            return self;
        };

        /**
         * Starts a new stroke.
         *
         * @param {MouseEvent} e  The event that triggered the start.
         * @param {SketchPad} sketchpad  The owning sketchpad instance.
         * @returns {void}
         */
        self.start = function (e, sketchpad) {
            _drawing = true;

            // Compute container offset
            var rect = sketchpad.container().getBoundingClientRect();
            _offset = { left: rect.left + window.pageXOffset, top: rect.top + window.pageYOffset };

            var x = e.pageX - _offset.left;
            var y = e.pageY - _offset.top;
            _points.push([x, y]);

            _c = sketchpad.paper().path();
            _c.attr({
                // CUSTOM
                "stroke-opacity": 0,
                "fill": _color,
                "fill-opacity": _opacity
            });
        };

        /**
         * Finishes the current stroke and returns the resulting path.
         *
         * @param {MouseEvent} e  The event that triggered the finish.
         * @param {SketchPad} sketchpad  The owning sketchpad instance.
         * @returns {Raphael.Element|null}  The finished path element or null.
         */
        self.finish = function (e, sketchpad) {
            var path = null;
            if (_c != null) {
                if (_points.length <= 1) {
                    _c.remove();
                } else {
                    path = _c;
                }
            }
            _drawing = false;
            _c = null;
            _points = [];
            return path;
        };

        /**
         * Continues the current stroke as the pointer moves.
         *
         * @param {MouseEvent} e  The event that triggered the move.
         * @param {SketchPad} sketchpad  The owning sketchpad instance.
         * @returns {void}
         */
        self.move = function (e, sketchpad) {
            if (_drawing) {
                var x = e.pageX - _offset.left;
                var y = e.pageY - _offset.top;
                _points.push([x, y]);
                _c.attr({ path: points_to_svg() });
            }
        };

        /**
         * Converts the collected points into an SVG path string.
         *
         * @private
         * @returns {string}  SVG path data.
         */
        function points_to_svg() {
            if (!_points || _points.length <= 1) { return ""; }
            var count_points = _points.length;

            if (!_curvy) {
                var path = "M" + _points[0][0] + "," + _points[0][1];
                for (var i = 1; i < count_points; i++) {
                    path += "L" + _points[i][0] + "," + _points[i][1];
                }
                path += "Z";
                return path;
            }

            // Simplify + fitCurve
            var to_simplify = [];
            for (var i = 0; i < count_points; i++) {
                to_simplify.push({ x: _points[i][0], y: _points[i][1] });
            }
            var points = simplify(to_simplify, _curvy_tolerance, false);
            count_points = points.length;

            var to_fit = [];
            for (var i = 0; i < count_points; i++) {
                to_fit.push([points[i].x, points[i].y]);
            }
            var points_curve = fitCurve(to_fit, _curvy_error);
            var count_curve = points_curve.length;
            if (!count_curve) { return ""; }

            var path = "";
            path += "M " + parseInt(points_curve[0][0][0]) + "," + parseInt(points_curve[0][0][1]) + " ";

            path += "C ";
            path += parseInt(points_curve[0][1][0]) + "," + parseInt(points_curve[0][1][1]) + " ";
            path += parseInt(points_curve[0][2][0]) + "," + parseInt(points_curve[0][2][1]) + " ";
            path += parseInt(points_curve[0][3][0]) + "," + parseInt(points_curve[0][3][1]) + " ";

            for (var i = 1; i < count_curve; i++) {
                path += "C ";
                path += parseInt(points_curve[i][1][0]) + "," + parseInt(points_curve[i][1][1]) + " ";
                path += parseInt(points_curve[i][2][0]) + "," + parseInt(points_curve[i][2][1]) + " ";
                path += parseInt(points_curve[i][3][0]) + "," + parseInt(points_curve[i][3][1]) + " ";
            }
            path += "Z";
            return path;
        }
    };

    Pen.MAX_WIDTH = 1000;
    Pen.MIN_WIDTH = 1;

    /* -----------------------------------------------------------------
       Utility: string representation of an object
       ----------------------------------------------------------------- */

    /**
     * Generates a human‑readable string representation of an object.
     *
     * @param {Object} obj  The object to inspect.
     * @returns {string}  String representation.
     */
    function inspect(obj) {
        var str = "";
        for (var i in obj) {
            str += i + "=" + obj[i] + "\n";
        }
        return str;
    }

})(window.Raphael);

/* -----------------------------------------------------------------
   Raphael.fn.display – keep for compatibility
   ----------------------------------------------------------------- */

/**
 * Renders an array of Raphael elements onto the paper.
 *
 * @param {Array} elements  Array of Raphael element descriptors.
 * @returns {void}
 */
Raphael.fn.display = function (elements) {
    for (var i = 0, n = elements.length; i < n; i++) {
        var e = elements[i];
        var type = e.type;
        this[type]().attr(e);
    }
};

/* -----------------------------------------------------------------
   Utility functions to compare objects by Phil Rathe
   ----------------------------------------------------------------- */

/**
 * Returns a string identifying the type of the given object.
 *
 * @param {*} o  The object to type‑check.
 * @returns {string}  One of: "string", "boolean", "number", "nan",
 *          "undefined", "null", "array", "date", "regexp",
 *          "object", or "function".
 */
function hoozit(o) {
    if (o.constructor === String) { return "string"; }
    if (o.constructor === Boolean) { return "boolean"; }
    if (o.constructor === Number) {
        return isNaN(o) ? "nan" : "number";
    }
    if (typeof o === "undefined") { return "undefined"; }
    if (o === null) { return "null"; }
    if (o instanceof Array) { return "array"; }
    if (o instanceof Date) { return "date"; }
    if (o instanceof RegExp) { return "regexp"; }
    if (typeof o === "object") { return "object"; }
    if (o instanceof Function) { return "function"; }
    return undefined;
}

/**
 * Calls a callback based on the object's type.
 *
 * @param {*} o  The object to inspect.
 * @param {Object} callbacks  Map of type names to functions.
 * @param {Array} args  Arguments to pass to the callback.
 * @returns {*}  Result of the callback.
 */
function bindCallbacks(o, callbacks, args) {
    var prop = hoozit(o);
    if (prop && typeof callbacks[prop] === "function") {
        return callbacks[prop].apply(callbacks, args);
    }
    return callbacks[prop];
}

/**
 * Deep equality comparison for arbitrary objects.
 *
 * @returns {Function}  A function that takes two values and returns
 *          true if they are deeply equivalent.
 */
var equiv = (function () {
    var innerEquiv;
    var callbacks = (function () {
        function useStrictEquality(b, a) {
            if (b instanceof a.constructor || a instanceof b.constructor) {
                return a == b;
            }
            return a === b;
        }
        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,
            "nan": function (b) { return isNaN(b); },
            "date": function (b, a) {
                return hoozit(b) === "date" && a.valueOf() === b.valueOf();
            },
            "regexp": function (b, a) {
                return hoozit(b) === "regexp" &&
                    a.source === b.source &&
                    a.global === b.global &&
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },
            "function": function () {
                return true;
            },
            "array": function (b, a) {
                if (!hoozit(b) === "array") { return false; }
                if (a.length !== b.length) { return false; }
                for (var i = 0; i < a.length; i++) {
                    if (!innerEquiv(a[i], b[i])) { return false; }
                }
                return true;
            },
            "object": function (b, a) {
                if (a.constructor !== b.constructor) { return false; }
                var aProps = [], bProps = [], eq = true;
                for (var i in a) {
                    aProps.push(i);
                    if (!innerEquiv(a[i], b[i])) { eq = false; }
                }
                for (var i in b) { bProps.push(i); }
                return eq && innerEquiv(aProps.sort(), bProps.sort());
            }
        };
    }());

    innerEquiv = function () {
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) { return true; }
        return (function (a, b) {
            if (a === b) { return true; }
            if (a === null || b === null || typeof a === "undefined" ||
                typeof b === "undefined" || hoozit(a) !== hoozit(b)) {
                return false;
            }
            return bindCallbacks(a, callbacks, [b, a]);
        })(args[0], args[1]) && arguments.callee.apply(this, args.slice(1));
    };

    return innerEquiv;
}());
