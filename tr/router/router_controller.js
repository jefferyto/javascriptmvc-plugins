$.Controller.extend('RouterController',
{
  onDocument:    true,
  currentParams: {},
  URLPrefix:     null
},
{
  "history.** subscribe": function(event_name, params) {
    //You'll also typically need to match the "index" history, which typically
    //occurs when no specific url has been entered.  You can route to your
    //default url here. 
    if(event_name == 'history.index') {
      this.publish("router.index_page");
      return;
    }

    var key = event_name.replace(/^history(\.*)/, '/');
    steal.dev.log('History event: ' + key);

    var foundRoute = Router.recognize(key);
    if (!foundRoute) {
      steal.dev.log("WARNING: Router failed to find route for: " + key);
      return;
    }
    
    this.publish(foundRoute.destination, foundRoute.params);
    RouterController.currentParams = foundRoute;
  },
  
  /**
   * Given an html uri, match it to a history point and update the history
   * of the page to navigate to that location.
   */
  "router.route_to subscribe": function(action_name, route_details) {
    var uri = route_details.uri;

    steal.dev.log("ROUTER: Request to route to " + uri);

    //Remove /dev.php from the uri;
    if (RouterController.URLPrefix) {
      var r = new RegExp(RouterController.URLPrefix);
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
      steal.dev.log("ROUTER: Detected appropriate history point: " + uriWithHash);
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
      var prefix = RouterController.URLPrefix || '';
      window.location = cl.protocol + '//' + cl.hostname + prefix + uriWithHash;
    }
  }
}
);
