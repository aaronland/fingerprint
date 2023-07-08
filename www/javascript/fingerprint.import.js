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
			    
			    var path = [];

			    var d = kid.getAttribute("d");
			    var m = d.match(/^M\s{0,}(\d+\,\d+)\s{0,}(L|C)/);
			    
			    if (! m){
				console.log("Invalid or unsupported path type", d);
				continue;
			    }

			    var preamble = m[0];
			    var start = m[1];
			    var path_type = m[2];

			    var xy = start.split(",");
			    var x = parseInt(xy[0]);
			    var y = parseInt(xy[1]);

			    path.push(["M", x, y ]);

			    d = d.replace(preamble, "");
			    d = d.replace(/Z$/, "");
			    
			    var points = d.split(path_type);
			    var count_points = points.length;
				    
			    for (var j=0; j < count_points; j++){
				
				var pt = points[j];
				var coords = pt.split(",");
				var count_coords = coords.length;
				
				var instructions = [
				    path_type
				];

				for (var k=0; k < count_coords; k++){
				    instructions.push(parseInt(coords[k]));
				}
								
				path.push(instructions);
			    }

			    path.push(["Z"]);
			    
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
