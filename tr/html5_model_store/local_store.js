if (('localStorage' in window) && ('sessionStorage' in window)) {
  jQuery.Class.extend("HTMLLocalStore", 
  {
    storageMethod:    "localStorage",
    storageNamespace: "models.", // change to app name
    
    init: function(klass) {
      this.storing_class_name = (typeof klass === "string" ? klass : klass.shortName).toLowerCase();
      this.storing_class = klass;
      this.storageNamespace += this.storing_class_name + ".";
	  },
    
    storageCall: function(method, params) {
      return window[this.storageMethod][method].apply(window[this.storageMethod], params);
    },
    
    removeById: function(id) {
      this.storageCall("removeItem", [this.storageNamespace + id]);
    },
    
    getById: function(id) {
      return this.storageCall("getItem", [this.storageNamespace + id]);
    },
    
    setById: function(id, value) {
      return this.storageCall("setItem", [this.storageNamespace + id, value]);
    },
	  
    findOne: function(id) {
      if (id && this.getById(id)) {
        return new this.storing_class(JSON.parse(this.getById(id)));
      } else {
        return null;
      }
	  },
	  
    create: function(obj, id){
		  id = id || obj[obj.Class.id];
		  this.setById(id, JSON.stringify(obj.attrs()));
	  },
	  
    destroy: function(id){
      this.removeById(id);
	  },
	  
    find: function(f){
      var instances = [];
      
      var i = -1, 
          len = window[this.storageMethod].length,
          prefixReg = new RegExp(this.storageNamespace.replace(/\./g, "\\."));
          
      while ( ++i < len ) { 
        var key   = this.storageCall("key", [i]);
        
        if (key.match(prefixReg)) {
          var value = this.findOne(key.replace(prefixReg, ""));
          if (!f || f(value)) {
            instances.push(value);
          } 
        }
      }
      
      return instances;
    },
    
    clear: function(){
      var i         = -1,
          len       = window[this.storageMethod].length,
          prefixReg = new RegExp(this.storageNamespace.replace(/\./g, "\\.")),
          toRemove  = [];
          
      while (++i < len) { 
        var key = this.storageCall("key", [i]);
        if (key.match(prefixReg)) {
          toRemove.push(key);
        }
      }
      
      for (var j = 0; j < toRemove.length; j++) {
        this.storageCall("removeItem", [toRemove[j]]);
      }
    },
    
    isEmpty: function() {
		  return !window[this.storageMethod].length;
		}
  });
  
} else {
  jQuery.Model.Store.extend("HTMLLocalStore", {}, {});
}
