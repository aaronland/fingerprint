var fingerprint = fingerprint || {};

fingerprint.render = (function(){

    /* https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer/serializeToString */
    const xml_serializer = new XMLSerializer();

    /* https://github.com/riversun/xml-beautify */
    const b = new XmlBeautify();	    
    
    var self = {

	asJSON: function(){
	    return fingerprint.application.sketchpad.json();
	},

	asSVGElement: function() {

	    var ed = document.getElementById("editor");
	    var svg_node = ed.getElementsByTagName("svg")[0];
	    
	    var svg_el = svg_node.cloneNode(true);

	    var svg_w = parseInt(svg_el.getAttribute("width"));
	    var svg_h = parseInt(svg_el.getAttribute("height"));		

	    var viewbox = "0 0 " + svg_w + " " + svg_h;
	    svg_el.setAttribute("viewBox", viewbox);

	    var dt = new Date();
	    svg_el.setAttribute("x-fingerprint-date", dt.toISOString());

	    // var desc_el = svg_el.getElementsByTagName("desc");
	    // console.log(desc_el);
	    
	    return svg_el;
	},

	asSVGString: function(){

	    const svg_el = self.asSVGElement();
	    return self.svgElementToString(svg_el);
	},

	svgElementToString: function(svg_el){
	    const svg_string = xml_serializer.serializeToString(svg_el);
	    return b.beautify(svg_string)
	},
	
	asPNG: function(max_dim){

	    if (! max_dim){
		max_dim = 4096;
	    }

	    const m = Math.max(window.innerHeight, window.innerWidth);
	    var scale = 1;

	    if (max_dim > m){
		scale = max_dim / m;
	    }

	    // console.log("max dim", max_dim);
	    // console.log("m", m);
	    // console.log("scale", scale);

		var svg_el = self.asSVGElement();

		if (scale){
		    
		    var svg_w = parseInt(svg_el.getAttribute("width"));
		    var svg_h = parseInt(svg_el.getAttribute("height"));		

		    console.log("SVG", svg_w, svg_h);
		    svg_el.setAttribute("width", svg_w * scale);
		    svg_el.setAttribute("height", svg_h * scale);		
		}

	    return self.asPNGWithSVGElement(svg_el);
	},
	
	asPNGWithSVGElement: function(svg_el){
	    
	    return new Promise((resolve, reject) => {
	
		function drawInlineSVG(ctx, rawSVG, callback) {
		    
		    var svg_blob = new Blob([rawSVG], {type:"image/svg+xml;charset=utf-8"});

		    var svg_url = URL.createObjectURL(svg_blob);
		    
		    var img = new Image;
		    
		    img.onload = function () {
			ctx.drawImage(this, 0, 0);     
			URL.revokeObjectURL(svg_url);
			callback(this);
		    };
		    
		    img.src = svg_url;
		};

		
		var png_w = svg_el.getAttribute("width");
		var png_h = svg_el.getAttribute("height");

		// console.log("PNG", png_w, png_h);
		
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		
		canvas.width = png_w;
		canvas.height = png_h;
		
		context.fillStyle = "white";
		context.fillRect(0, 0, canvas.width, canvas.height);

		var svg_str = fingerprint.render.svgElementToString(svg_el);
		
		drawInlineSVG(context, svg_str, function() {
		    
		    canvas.toBlob(function(blob) {
			resolve(blob);
		    });
		    
		});
		
	    });
	    
	},
    };

    return self;
})();
