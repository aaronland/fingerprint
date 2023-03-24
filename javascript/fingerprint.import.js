var fingerprint = fingerprint || {};

fingerprint.import = (function(){

    var self = {

	dialog: function(){

	    var dialog_el = document.getElementById("import-dialog");
	    dialog_el.showModal();
	},

	import: function(){

	    var dialog_el = document.getElementById("import-dialog");
	    dialog_el.close();
	    
	    let files_el = document.getElementById("import-dialog-files");
	    let files = files_el.files;
	    
	    if (files.length == 0){
		return;
	    }

	    let file = files[0];

	    file.text().then((body) => {

		const parser = new DOMParser();
		const doc = parser.parseFromString(body, "image/svg+xml");

		var root = doc.children[0];

		if (root.nodeName != "svg"){
		    fingerprint.feedback.error("Not an SVG document.");		    
		    return;
		}

		var dt = root.getAttribute("x-fingerprint-date");

		if (dt == ""){
		    fingerprint.feedback.error("Doesn't look like a fingerprint document.");
		    return;
		}
		
		var children = root.children;
		var count = children.length;

		var strokes = [];
		
		for (var i=0; i < count; i++){

		    var kid = children[i];

		    switch (kid.nodeName){
			case "desc":
			    break;
			case "defs":
			    break;
			case "path":
			    
			    var d = kid.getAttribute("d");

			    /*
			    if (! d.endsWith("Z")){
				fingerprint.feedback.error("Unexpected path at offset " + i + ", missing Z");
				return;
			    }
			    */
			    
			    var path = [];
			    
			    var points = d.split("L");
			    var count_points = points.length;

			    for (var j=0; j < count_points; j++){

				var pt = points[j];
				var coords = pt.split(",");

				var x = coords[0];
				var y = coords[1];

				var prefix = "L";

				if (x.startsWith("M")){
				    prefix = "M";
				    x = x.replace("M", "");
				}

				x = parseInt(x);
				y = parseInt(y);

				var instruction = [ prefix, x, y ];

				if (j == (count_points - 1)){
				    instruction.push("Z");
				}

				path.push(instruction);
			    }
			    
			    var s = {
				"type":"path",
				"path": path,
				"fill": kid.getAttribute("fill"),
				"fill-opacity": kid.getAttribute("fill-opacity"),				
				"stroke-opacity": kid.getAttribute("stroke-opacity"),
				// "stroke-width": kid.getAttribute("stroke-width"),
				// "stroke-linecap": kid.getAttribute("stroke-linecap"),
				// "stroke-linejoin": kid.getAttribute("stroke-linejoin"),
			    };

			    strokes.push(s);
			    break;
			    
			default:
			    fingerprint.feedback.error("Unexpected SVG element at offset " + i + ", " + kid.nodeName);
			    return;
		    }
		}

		var item = {
		    strokes: strokes,
		};

		var key = file.name.replace(".svg", "");
		fingerprint.drawing.load(item, key);
		
		return;

	    }).catch((err) => {
		fingerprint.feedback.error("Failed to read input, " + err);
	    });
	    	    
	    // fingerprint.feedback.info("Import file...");
	},

    };

    return self;

    })();
