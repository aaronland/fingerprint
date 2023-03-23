var fingerprint = fingerprint || {};

fingerprint.menu = (function(){

    var self = {

	toggle: function(){
	    
	    var contents = document.getElementById("footer-menu-contents");
	    
	    if (contents.style.display == "block"){
		contents.style.display = "none";
	    } else {
		contents.style.display = "block";
	    }
	},

	update: function(){

	    var data = fingerprint.application.sketchpad.strokes();
		
		if (data.length > 0 ){
		    
		    if (fingerprint.capabilities.share()){
			self.show_share_control();	    		
		    }
		    
		    if (fingerprint.capabilities.export()){
			self.show_export_control();
		    }
		    
		    self.show_viewsource_control();
		    self.show_new_control();
		    self.show_save_control();
		    
		} else {
		    
		    self.hide_share_control();	    
		    self.hide_export_control();
		    self.hide_viewsource_control();
		    self.hide_new_control();
		    self.hide_save_control();		    
		}
		
		var editor_el = document.getElementById("editor")
		var panel_title = editor_el.getAttribute("data-panel-title");
		
		if (panel_title){
		    self.show_remove_control();	    	    
		} else {
		    
		    self.hide_remove_control();	    	    
		    
		    if (data.length == 0){
			self.hide_save_control();	    	    		
		    }
		}

	},

	show_offline_control: function(){
	    self.toggle_control("menu-contents-offline", "block");
	},

	hide_offline_control: function(){
	    self.toggle_control("menu-contents-offline");	    
	},
	
	show_share_control: function(){
	    self.toggle_control("menu-contents-share", "block");
	},

	hide_share_control: function(){
	    self.toggle_control("menu-contents-share");	    
	},

	show_save_control: function(){
	    self.toggle_control("menu-contents-save", "block");	    
	},

	hide_save_control: function(){
	    self.toggle_control("menu-contents-save");
	},

	show_export_control: function(){
	    self.toggle_control("menu-contents-export", "block");	    
	},

	hide_export_control: function(){
	    self.toggle_control("menu-contents-export");
	},

	show_viewsource_control: function(){
	    self.toggle_control("menu-contents-viewsource", "block");	    
	},

	hide_viewsource_control: function(){
	    self.toggle_control("menu-contents-viewsource");
	},
	
	show_new_control: function(){
	    self.toggle_control("menu-contents-new", "block");	    
	},

	hide_new_control: function(){
	    self.toggle_control("menu-contents-new");
	},

	show_remove_control: function(){
	    self.toggle_control("menu-contents-remove", "block");	    
	},

	hide_remove_control: function(){
	    self.toggle_control("menu-contents-remove");
	},
	
	toggle_control: function(id, style){
	    var el = document.getElementById(id);

	    if (! el){
		console.log("Unable to find element, " + id);
		return false;
	    }

	    if (! style){
		style = "none";
	    }
	    
	    el.style.display = style;
	},
	
    };

    return self;

})();
