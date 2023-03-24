var fingerprint = fingerprint || {};

fingerprint.viewsource = (function(){

    var self = {

	viewsource_dialog: function(){

	    var svg_str = fingerprint.render.asSVGString();

	    var pre_el = document.getElementById("view-source");
	    pre_el.innerText = svg_str;
	    
	    var dialog_el = document.getElementById("view-source-dialog");
	    dialog_el.showModal();
	},

	copy_to_clipboard: function(){

	    var el = document.getElementById("view-source");
	    var doc = el.textContent;
	    
	    const type = "text/plain";
	    const blob = new Blob([ doc ], { type });
	    
	    /* this is not supported in FF */
	    const data = [new ClipboardItem({ [type]: blob })];
	    
	    navigator.clipboard.write(data).then(() => {
		
		fingerprint.feedback.info("Copied to clipboard");
		
	    }).catch((err) => {
		fingerprint.feedback.error("Failed to copy: " + err);
	    });
	    
	    return false;
	    
	},
    };

    return self;
})();
