var fingerprint = fingerprint || {};

fingerprint.colours = (function(){

    var self = {

	dialog: function(){

	    var el = document.getElementById("colour-picker");
	    el.showModal();
	    
	},

	set_colour: function(){

            var colour = document.getElementById('colour').value;
            var opacity = document.getElementById('opacity').value;

	    self.assign_colour(colour, opacity);
	},

	assign_colour: function(colour, opacity){
	    
            document.getElementById('selected-colour').style.backgroundColor = colour;
            document.getElementById('selected-colour').style.opacity = opacity;

	    var rgb = self.hexToRgb(colour);

	    if (rgb){
		var preview_el = document.getElementById("current-colour-preview");
		preview_el.style.backgroundColor = "rgb(" + rgb.r + " " + rgb.g + " " + rgb.b + " / " + opacity + ")";
	    }
	    
	    if (fingerprint.application.sketchpad){
		
		var pen = fingerprint.application.sketchpad.pen();	       
		pen.opacity(opacity);
		pen.color(colour);
	    }
	},

	get_colour: function(){
	    return document.getElementById('selected-colour').style.backgroundColor;
	},

	get_opacity: function(){
	    return document.getElementById('selected-colour').style.opacity;
	},

	// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	
	hexToRgb: function(hex) {
	    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	    });
	    
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	    } : null;
	},
	
    };

    return self;
})();
