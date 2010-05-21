module("HTML5 Model Store");

jQuery.Model.extend("TestModel", 
{
  setup: function(){
		this.storeType = HTMLSessionStore;
    this._super.apply(this, arguments);
	}
},
{
});

var resetStorage = function() {
  sessionStorage.clear();
};

test("Create item in store manually", function(){
  resetStorage();
  
  equals(sessionStorage.length, 0);
  var testModel = new TestModel({ id: 1, name: "test" });
  
  resetStorage();
  TestModel.store.create(testModel);
  equals(sessionStorage.length, 1);
});

test("Create item in store via Model", function(){
  resetStorage();
  
  equals(sessionStorage.length, 0);
  var testModel = new TestModel({ id: 1, name: "test" });
  equals(sessionStorage.length, 1);
});

test("FindOne item in store", function(){
  resetStorage();
  
  equals(sessionStorage.length, 0);
  var testModel  = new TestModel({ id: 1, name: "test" });
  var foundModel = TestModel.store.findOne(1);
  equals(foundModel.name, testModel.name);
});

test("Remove item from store", function(){
  resetStorage();
  
  equals(sessionStorage.length, 0);
  var testModel = new TestModel({ id: 1, name: "test" });
  equals(sessionStorage.length, 1);
  TestModel.store.destroy(testModel.id);
  equals(sessionStorage.length, 0);
});

test("Search items in store", function(){
  resetStorage();
  expect(2);
  
  equals(sessionStorage.length, 0);
  var testModel = new TestModel({ id: 1, name: "test" });
  
  TestModel.store.find(function(foundModel) {
    start();
    equals(foundModel.name, testModel.name);
  });
  stop();
});

test("Clear store", function(){
  resetStorage();
  
  equals(sessionStorage.length, 0);
  var testModel = new TestModel({ id: 1, name: "test" });
  equals(sessionStorage.length, 1);
  TestModel.store.clear();
  equals(sessionStorage.length, 0);
});
