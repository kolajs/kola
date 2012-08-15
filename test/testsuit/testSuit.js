(function(){
	var TestCase = function(name, run, asyn){
		this.status = "waiting";
		this.name = name;
		this._run = run;
		this.asyn = asyn;
		this.succCase = 0;
		this.failCase = 0;
		this.errorMessage = "";
	}
	function cleanUp(){
		if(window.parent && window.parent.onTestEnd)
			window.parent.onTestEnd(this, window);
	}
	TestCase.prototype.run = function(){
		try{
			this._run(this);
		}catch(e){
			this.status = "fail";
			this.errorMessage = e.message;
			throw e;
		}
		if(!this.asyn){
			this.end()
		}
	}
	TestCase.prototype.end = function(){
		if(this.status == "waiting"){
			this.status = "success";
		}
		cleanUp.call(this);
	}
	TestCase.prototype.fail = function(why){
		this.status = "fail";
		this.failCase ++;
		this.errorMessage += why + "\n"
		cleanUp.call(this);
	}
	TestCase.prototype.test = function(value, why){
		if(!value){
			this.fail(why);
		}else{
			this.succCase ++;
			cleanUp.call(this);
		}
	}
	TestCase.prototype.log = function(txt){
		console.log(txt);
	}
	window.testCases = []
	window.test = function(name, run, asyn){
		var newCase=new TestCase(name, run, asyn)
		testCases.push(newCase);
		if(window.parent && window.parent.onNewCase)
			window.parent.onNewCase(newCase, window);
	}
})();