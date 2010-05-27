module("State Machine Controller");

TR.StateMachine.Controller.extend("TestController", {
},
{
  states: {
    global:     { globalEvent:             "stateSix" },
    
    initial:    { move:                    "stateTwo",
                  "globalEvent subscribe": "stateThree",
                  "a click":               "stateFour",
                  "click":                 "stateFive" },
    stateTwo:   { },
    stateThree: { },
    stateFour:  { },
    stateFive:  { },
    stateSix:  { }
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

test("Listens to openajax events", function(){
  var testController = new TestController($("<div />").get(0));
  OpenAjax.hub.publish("globalEvent");
	equals(testController.currentStateName, "stateThree");
});

test("Listens to jQuery DOM events on subelements", function(){
  var testController = new TestController($("<div><a href=''></a></div>").get(0));
  testController.element.find("a").click();
	equals(testController.currentStateName, "stateFour");
});

test("Listens to jQuery DOM events", function(){
  var testController = new TestController($("<div />").get(0));
  testController.element.click();
	equals(testController.currentStateName, "stateFive");
});

test("Ignores others' DOM events", function(){
  var testController1 = new TestController($("<div><a href=''></a></div>").get(0));
  testController1.element.find("a").click();
	equals(testController1.currentStateName, "stateFour");
	
  var testController2 = new TestController($("<div />").get(0));
  testController2.element.click();
	equals(testController2.currentStateName, "stateFive");
});

test("Global events work in all states", function(){
  var testController = new TestController($("<div />").get(0));
  testController.publishState("globalEvent");
	equals(testController.currentStateName, "stateSix");
	
  testController.moveToState("stateTwo");
  testController.publishState("globalEvent");
	equals(testController.currentStateName, "stateSix");
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
