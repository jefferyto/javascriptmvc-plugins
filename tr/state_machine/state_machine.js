steal.plugins('jquery/class').then(function($) {
  if (steal.options.env == 'production') {
    steal.dev = steal.dev || { log: function(){} };
  }

  jQuery.Class.extend("TR.StateMachine",
  {
    stateSuffixCounter: {},
    domEventRegex:      function() {
      var domEvents= [ "change", "click", "contextmenu", "dblclick", "keydown", "keyup",
                       "keypress", "mousedown", "mousemove", "mouseout", "mouseover",
                       "mouseup", "reset", "windowresize", "resize", "windowscroll", 
                       "scroll", "select", "submit", "dblclick", "focusin", "focusout", 
                       "load", "unload", "ready", "hashchange", "mouseenter", 
                       "mouseleave"];
      return new RegExp("\\s?(" + domEvents.join("|") + ")$")
    }()
  },
  {    
    states:           null,
    eventMap:         null,
    stateSuffix:      null,
    currentStateName: "initial",

    init: function(states) {
      this.states = states || {
        initial: { }
      };
          
      // Event suffix so only our instance gets events
      this.stateSuffix = this.getSuffix();
      
      this.eventMap = {};
      $.each(this.states, this.callback("generateEventMap"));
      
      // Initalize state machine
      //this.currentStateName = ("initial");
      //steal.dev.log("FSM (" + this.stateSuffix + "): Initializing");
      
      OpenAjax.hub.subscribe("**", this.callback("handlePublish"));
    },
    
    alreadyBound: {},
    generateEventMap: function(stateName, value) {
      var forInstance = this.Class.OPTIONS.forInstance || this;
      
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
          var eventMatch = transitionEvent.match(this.Class.domEventRegex);
          if (eventMatch) {
            var eventSelector = transitionEvent.replace(this.Class.domEventRegex, "");
            var eventName = transitionEvent.replace(/\s/g, '-');
            if (!this.alreadyBound[eventName]) {
              this.alreadyBound[eventName] = true;
            
              var eventBinding = this.callback(function(eventName, event) {
                event.preventDefault();
                this.publishState(eventName);
              }, eventName);
              
              if (eventSelector.length > 0) {
                if (eventSelector === "window") {
                  var eventRename = (eventMatch[1] == "windowresize") ? "resize" : eventMatch[1];
                  $(window).bind(eventRename, eventBinding);
                } else {
                  $(forInstance.element).delegate(eventSelector, eventMatch[1], eventBinding);
                }
              } else {
                $(forInstance.element).bind(eventMatch[1], eventBinding);
              }
            
            }
            var eventName = eventName + '.' + this.stateSuffix;
          } else {
            var eventName = transitionEvent + '.' + this.stateSuffix;
          }
        }
        
        this.eventMap[stateName]            = this.eventMap[stateName] || {};
        this.eventMap[stateName][eventName] = value[transitionEvent];
      }
    },
    
    //"** subscribe": function(event_name) {
    handlePublish: function(event_name) {
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
      var forInstance = this.Class.OPTIONS.forInstance || this;

      if (this.currentState() && this.currentState()[callbackName]) {
        var functionDef = this.currentState()[callbackName];
        if (typeof functionDef === "string") {
          // If we're calling a named function
          if (forInstance[functionDef]) {
            forInstance[functionDef].apply(forInstance, [oldStateName]);
          } else {
            // otherwise we publish an event
            OpenAjax.hub.publish(functionDef, forInstance);
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
      OpenAjax.hub.publish(event + '.' + this.stateSuffix, params);
    },
    
    getSuffix: function() {
      var forInstance = this.Class.OPTIONS.forInstance || this,
          className   = forInstance.Class.shortName;
  
      this.Class.stateSuffixCounter[className] = this.Class.stateSuffixCounter[className] || 0;
      return className + ".instance" + this.Class.stateSuffixCounter[className]++;
    }
  }
  );
});
