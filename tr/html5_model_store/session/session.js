steal.plugins('tr/html5_model_store/local').then(function($){

  TR.HTML5ModelStore.Local.extend("TR.HTML5ModelStore.Session", {
    storageMethod: "sessionStorage"
  });
  
});
