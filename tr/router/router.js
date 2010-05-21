steal.plugins('steal/openajax',
              'jquery/controller',
              'jquery/controller/subscribe',
              'jquery/controller/history')
     .then("uniform_string_prototype_split")
     .then("sherpa")
     .then(function() {
            Router = new Sherpa.Router();
           })
     .then("router_controller");
