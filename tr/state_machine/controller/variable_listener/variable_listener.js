TR.StateMachine.Controller.extend('TR.StateMachine.Controller.VariableListener',
{
  onDocument: true
},
{
  states: { },
  
  init: function(variables, event_name) {
    var eventPermuations = $.map(variables, function(item, i) {
      var event = item.namespace + "." + item.name + "." + item.event_type;
      return { stateName: "v" + (i+1), movementEvent: event };
    });

    this.permute(eventPermuations);
    
    this.states.allVariablesSet.onEnter = function() { 
      /* Fire event on complete */
      front_controller.publish(this.event_name);
    
      /* Move back to initial */
      this.moveToState("initial");
    };
      
    this._super(document.body);
  },
  
  lastState: null,
  permute: function(theSet) {
    if (theSet.length <= 0) {
      return;
    }
    
    var namedSet = $.map(theSet, function(item) { return item.stateName; });
    
    var targetState = namedSet.join("-");
    if (!this.lastState) {
      this.lastState = targetState;
    }

    for (var i = 0; i < theSet.length; i++) {
      var newSet = theSet.slice(0);
      var thisItem = newSet.splice(i, 1)[0];
      
      var namedSet2 = $.map(newSet, function(item) { return item.stateName; });
      var newSetState = namedSet2.join("-");
      
      if (newSetState.length < 1) {
        newSetState = "initial";
      }
      
      if (targetState == this.lastState) {
        targetState = "allVariablesSet";
      }
      
      this.states[newSetState] = this.states[newSetState] || {};
      this.states[newSetState][thisItem.movementEvent] = targetState;
      this.permute(newSet);
    }
  },
  
  "variable.set subscribe":    function(e, p) { this.checkEvent(e, p); },
  "variable.update subscribe": function(e, p) { this.checkEvent(e, p); },
  "variable.unset subscribe":  function(e, p) { this.checkEvent(e, p); },
  
  checkEvent: function(event_name, params) {
    var matches = event_name.match(/^variable\.(.*)$/);
    event_type = matches[1]; /* set, update, unset */
    var key = '';
    
    if(params.namespace)
    {
      key = params.namespace + '.';
    }
    key += params.name + '.' + event_type;
    
    if(this.variable_events[key] !== undefined)
    {
      this.publishState(key);
    }
  }
}
);
