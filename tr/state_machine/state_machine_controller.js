jQuery.Controller.extend("StateMachineController",
{
  statePrefixCounter: { }
},
{
  states: {
    initial: { }
  },
  
  statePrefix:      null,
  currentStateName: null,

  setup: function() {
    this._super.apply(this, arguments);
    
    // Event prefix so only our instance gets events
    this.statePrefix = this.getPrefix();
    
    // Initalize state machine
    this.moveToState("initial");
    //steal.dev.log("FSM (" + this.statePrefix + "): Initializing");
  },
  
  "** subscribe": function(event_name) {
    var stateMachineRegex = new RegExp("^" + this.statePrefix);
    if (!event_name.match(stateMachineRegex)) {
      return;
    }
  
    var withoutNamespace = event_name.replace(this.statePrefix + ".", "");
    for(var transitionEvent in this.currentState()) {
      if (transitionEvent === withoutNamespace) {
        //steal.dev.log(this.statePrefix + " received " + transitionEvent + " while in state: " + this.currentStateName);
        
        var newTargetState = this.currentState()[transitionEvent];
        if (!this.states[newTargetState]) {
          steal.dev.warn(this.statePrefix + " tried to move to a state which is not defined: " + newTargetState);
          return;
        }
        
        this.moveToState(newTargetState);
        break;
      }
    }
  },
  
  didMoveToState: function(newState, oldState) {
    if (oldState) {
      steal.dev.log("FSM (" + this.statePrefix + "): " + oldState + " -> " + newState);
    }
  },
  
  moveToState: function(stateName) {
    this.stateChangeCallback("onExit", stateName);
  
    var oldStateName      = this.currentStateName;
    this.currentStateName = stateName;
    this.didMoveToState(this.currentStateName, oldStateName);
    
    this.stateChangeCallback("onEnter", oldStateName);
  },
  
  stateChangeCallback: function(callbackName, oldStateName) {
    if (this.currentState() && this.currentState()[callbackName]) {
      var functionDef = this.currentState()[callbackName];
      if (typeof functionDef == "string") {
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
  
  publishState: function(event) {
    OpenAjax.hub.publish.apply(OpenAjax.hub, [this.statePrefix + "." + event]);
  },
  
  getPrefix: function() {
    var controllerName = this.Class.fullName;
    
    if (!StateMachineController.statePrefixCounter[controllerName]) {
      StateMachineController.statePrefixCounter[controllerName] = 0;
    }
  
    return controllerName + ".instance" + StateMachineController.statePrefixCounter[controllerName]++;
  }
});
