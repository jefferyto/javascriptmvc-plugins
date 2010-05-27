steal.then("uniform_string_prototype_split")
     .then("sherpa")
     .then(function($) {

if (steal.options.env == 'production') {
  steal.dev = steal.dev || { log: function(){} };
}

Router = new Sherpa.Router();

$.Class.extend("TR.Router",
{
  currentParams: {},
  URLPrefix:     null,
  
  init: function() {
    OpenAjax.hub.subscribe("history.**", function(event_name) {
      //You'll also typically need to match the "index" history, which typically
      //occurs when no specific url has been entered.  You can route to your
      //default url here. 
      if(event_name === 'history.index') {
        OpenAjax.hub.publish("router.index_page");
        return;
      }

      var key = event_name.replace(/^history(\.*)/, '/');
      //steal.dev.log('History event: ' + key);

      var foundRoute = Router.recognize(key);
      if (!foundRoute) {
        steal.dev.log("WARNING: Router failed to find route for: " + key);
        return;
      }
      
      this.currentParams = foundRoute.params;
      OpenAjax.hub.publish(foundRoute.destination, foundRoute.params);
    });
  },
  
  /**
   * Given an html uri, match it to a history point and update the history
   * of the page to navigate to that location.
   */
  routeTo: function(uri) {
    //steal.dev.log("ROUTER: Request to route to " + uri);

    //Remove /dev.php from the uri;
    if (this.URLPrefix) {
      var r = new RegExp(this.URLPrefix);
      uri = uri.replace(r, '');
    }
    
    var uriWithHash = "#" + uri;

    if (window.location.hash === uriWithHash) {
      steal.dev.log("ROUTER: Already at " + uriWithHash);
      return;
    }
    
    var route = Router.recognize(uri);
    if (!route) {
      //No route.  Let it go.  Add a '#' to the end so that we don't infinite redirect.
      window.location.href = uri + '#';
      return;
    } else {
      //steal.dev.log("ROUTER: Detected appropriate history point: " + uriWithHash);
    }

    var components = window.location.href.split('#');
    if (components.length > 1) {
      steal.dev.log('ROUTER: ' + window.location.hash + ' -> ' + uriWithHash);
      if (window.location.hash !== uriWithHash) {
        window.location = components[0] + uriWithHash;
        return true;
      } else {
        return false;
      }
    } else { //let's "redirect" to the appropriate javascriptmvc uri
      var cl = window.location;
      var prefix = this.URLPrefix || '';
      window.location = cl.protocol + '//' + cl.hostname + prefix + uriWithHash;
    }
  }
},
{
}
);

});
