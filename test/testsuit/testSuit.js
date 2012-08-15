(function(){
	function getNewCase(name, _run, asyn){
		var newCase = function(value, why){
			test.call(newCase, value, why)
		}
		newCase.status = "waiting";
		newCase.caseName = name;
		newCase._run = _run;
		newCase.asyn = asyn;
		newCase.succCase = 0;
		newCase.failCase = 0;
		newCase.errorMessage = "";

		newCase.run = function (){run.call(newCase)}
		newCase.end = function (){end.call(newCase)}
		newCase.log = function (message){log.call(newCase, message)}

		return newCase;
	}

	function cleanUp(){
		if(window.parent && window.parent.onTestEnd)
			window.parent.onTestEnd(this, window);
	}
	var run = function(){
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
	var end = function(){
		if(this.status == "waiting"){
			this.status = "success";
		}
		cleanUp.call(this);
	}
	fail = function(why){
		this.status = "fail";
		this.failCase ++;
		this.errorMessage += why + "\n"
		cleanUp.call(this);
	}
	var test = function(value, why){
		if(!value){
			fail.call(this, why);
		}else{
			this.succCase ++;
			cleanUp.call(this);
		}
	}
	var log = function(txt){
		console.log(txt);
	}

	window.testCases = []
	window.test = function(name, run, asyn){
		var newCase = getNewCase(name, run, asyn)
		testCases.push(newCase);
		if(window.parent && window.parent.onNewCase)
			window.parent.onNewCase(newCase, window);
	}
})();