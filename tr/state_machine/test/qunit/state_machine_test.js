module("State Machine Controller");

TR.StateMachine.Controller.extend("TestController", {
},
{
  states: {
    initial:  { move: "stateTwo" },
    stateTwo: { }
  }
});

test("Begins in initial state", function(){
  var testController = new TestController($("<div />").get(0));
	equals(testController.currentStateName, "initial");
});

test("Moves on to next state", function(){
  var testController = new TestController($("<div />").get(0));
  testController.publishState("move");
	equals(testController.currentStateName, "stateTwo");
});

test("onExit and onEnter callbacks", function(){
  var testController = new TestController($("<div />").get(0));
  
  expect(2);
  
  testController.states.initial.onExit = function() {
    testController.onExitRan = true;
  };
  
  testController.states.stateTwo.onEnter = function() {
    start();
    testController.onEnterRan = true;
  };
  
  stop();
  testController.publishState("move");
  
	ok(testController.onExitRan, "onExit ran");
	ok(testController.onEnterRan, "onEnter ran");
});
