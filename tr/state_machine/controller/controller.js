steal.plugins('jquery/controller/subscribe', 
              'jquery/controller', 
              'steal/openajax')
     .then(function($) {
     
  if (steal.options.env == 'production') {
    steal.dev = steal.dev || { log: function(){} };
  }

  jQuery.Controller.extend("TR.StateMachine.Controller",
  {
    stateSuffixCounter: { },
    domEvents:        ["change", "click", "contextmenu", "dblclick", "keydown", "keyup",
                       "keypress", "mousedown", "mousemove", "mouseout", "mouseover",
                       "mouseup", "reset", "windowresize", "resize", "windowscroll", 
                       "scroll", "select", "submit", "dblclick", "focusin", "focusout", 
                       "load", "unload", "ready", "hashchange", "mouseenter", 
                       "mouseleave"]
  },
  {
    states: {
      initial: { }
    },
    
    eventMap:         null,
    stateSuffix:      null,
    currentStateName: null,

    setup: function() {
      this._super.apply(this, arguments);
      
      // Event suffix so only our instance gets events
      this.stateSuffix = this.getSuffix();
      
      // Initalize state machine
      this.moveToState("initial");
      //steal.dev.log("FSM (" + this.stateSuffix + "): Initializing");
      
      this.domEventRegex = new RegExp("\\s?(" + TR.StateMachine.Controller.domEvents.join("|") + ")$");
      this.eventMap = {};
      $.each(this.states, this.callback("generateEventMap"));
    },
    
    generateEventMap: function(key, value) {
      if (this.states["global"]) {
        $.extend(value, this.states["global"]);
      }
      
      for(var transitionEvent in value) {
        if (transitionEvent.match(/^on(Enter|Exit)$/)) {
          continue;
        }
      
        if (transitionEvent.match(/subscribe$/)) {
          var eventName = transitionEvent.replace(" subscribe", "");
        } else {
          var eventMatch = transitionEvent.match(this.domEventRegex);
          if (eventMatch) {
            var eventSelector = transitionEvent.replace(this.domEventRegex, "");
            var eventName = transitionEvent.replace(/\s/g, '-');
            
            var eventBinding = this.callback(function(eventName, event) {
              event.preventDefault();
              this.publishState(eventName);
            }, eventName);
              
            if (eventSelector.length > 0) {
              if (eventSelector === "window") {
                var eventRename = (eventMatch[1] == "windowresize") ? "resize" : eventMatch[1];
                this.bind(window, eventRename, eventBinding);
              } else {
                this.delegate(this.element, eventSelector, eventMatch[1], eventBinding);
              }
            } else {
              this.bind(this.element, eventMatch[1], eventBinding);
            }
            
            var eventName = eventName + '.' + this.stateSuffix;
          } else {
            var eventName = transitionEvent + '.' + this.stateSuffix;
          }
        }
        
        this.eventMap[key]            = this.eventMap[key] || {};
        this.eventMap[key][eventName] = value[transitionEvent];
      }
    },
    
    "** subscribe": function(event_name) {
      try {
        var eventMap = this.eventMap[this.currentStateName];
      } catch(e) {
        //console.debug(this);
        //console.debug(event_name);
      }
      if (typeof eventMap !== "undefined") {
        var targetState = eventMap[event_name];
        if (typeof targetState !== "undefined") {
          this.moveToState(targetState);
        }
      }
    },

    moveToState: function(stateName) {
      if (!this.states[stateName]) {
        steal.dev.log(this.stateSuffix + " tried to move to a state which is not defined: " + stateName);
        return;
      }
      
      this.stateChangeCallback("onExit", stateName);
    
      var oldStateName      = this.currentStateName;
      this.currentStateName = stateName;
      this.publishState("didMoveToState", { to: this.currentStateName, from: oldStateName });
      
      if (oldStateName && (oldStateName !== this.currentStateName)) {
        steal.dev.log("FSM (" + this.stateSuffix + "): " + oldStateName + " -> " + this.currentStateName);
      }
      
      this.stateChangeCallback("onEnter", oldStateName);
    },
    
    stateChangeCallback: function(callbackName, oldStateName) {
      if (this.currentState() && this.currentState()[callbackName]) {
        var functionDef = this.currentState()[callbackName];
        if (typeof functionDef === "string") {
          // If we're calling a named function
          if (this[functionDef]) {
            this[functionDef].apply(this, [oldStateName]);
          } else {
            // otherwise we publish an event
            this.publish(functionDef, this);
          }
        } else {
          this.callback(functionDef)(oldStateName);
        }
      }
    },

    currentState: function() {
      return this.states[this.currentStateName];
    },
    
    publishState: function(event, params) {
      OpenAjax.hub.publish.apply(OpenAjax.hub, [event + '.' + this.stateSuffix, params]);
    },
    
    getSuffix: function() {
      var controllerName = this.Class.shortName;
      
      if (!TR.StateMachine.Controller.stateSuffixCounter[controllerName]) {
        TR.StateMachine.Controller.stateSuffixCounter[controllerName] = 0;
      }
    
      return controllerName + ".instance" + TR.StateMachine.Controller.stateSuffixCounter[controllerName]++;
    }
  }
  );
  
});
