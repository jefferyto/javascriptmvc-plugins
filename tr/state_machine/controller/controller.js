steal.plugins('jquery/controller/subscribe', 
              'jquery/controller',
              'steal/openajax',
              'tr/state_machine')
     .then(function($) {
     
  jQuery.Controller.extend("TR.StateMachine.Controller",
  {
  },
  {
    stateMachine: null,
    
    setup: function() {
      this._super.apply(this, arguments);
      
      var BoundStateMachine = TR.StateMachine({ forInstance: this });
      this.stateMachine     = new BoundStateMachine(this.states);
    },
    
    publishState: function() {
      return this.stateMachine.publishState.apply(this.stateMachine, arguments);
    },
    
    currentState: function() {
      return this.stateMachine.currentState.apply(this.stateMachine, arguments);
    },
    
    moveToState: function() {
      return this.stateMachine.moveToState.apply(this.stateMachine, arguments);
    },
    
    stateSuffix: function() {
      return this.stateMachine.stateSuffix;
    },
    
    currentStateName: function() {
      return this.stateMachine.currentStateName;
    }
  }
  );
  
});
