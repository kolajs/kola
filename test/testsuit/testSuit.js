(function(){
	function getNewCase(name, _run, asyn){
		var newCase = function(value, why){
			test.call(newCase, value, why)
		}
		
		var runstr = _run.toString();
		var testCaseName = /function[ ]*\([ ]*([0-9a-zA-Z$_]+)/.exec(runstr);
		newCase.expectCase = runstr.match(RegExp('[^0-9a-zA-Z$_]' + testCaseName[1] + '\\(', 'g')).length;
		
		newCase.status = 'waiting';
		newCase.caseName = name;
		newCase._run = _run;
		newCase.asyn = asyn;
		
		newCase.succCase = 0;
		newCase.failCase = 0;
		newCase.errorMessage = '';

		newCase.run = function (){run.call(newCase)}
		newCase.getMessage = function (){run.call(newCase)}
		newCase.end = function (){end.call(newCase)}
		newCase.log = function (message){log.call(newCase, message)}

		newCase.window = window;

		return newCase;
	}
	if(!window){
		//to do :nonbrowser(node.js) support
	}else{
		window.testCases = []
		var targetWindow;
		if(window.parent && window.parent.onNewCase){
			targetWindow = window.parent;
		}else{
			var scripts = document.getElementsByTagName("script");
			for(var i = scripts.length;--i;){
				if(scripts[i].src.indexOf("testSuit.js")!=-1){
					var src = scripts[i].src
					break;
				}
			}
			var iframe = document.createElement("iframe")
			iframe.style.cssText = "margin:0;width:100%;border:1px solid black"
			iframe.src = src.replace("testSuit.js","Run.html");
			setTimeout(function(){
				document.body.appendChild(iframe);
				setTimeout(function(){
					targetWindow = iframe.contentWindow;
				});
			});
			
		}
	}
	
	function statusChange(){
		targetWindow.onTestEnd(this);
	}
	var run = function(){
		this.status = 'testing';
		statusChange.call(this);
		try{
			this._run(this);
		}catch(e){
			this.fail('Exception:' + e.message);
			throw e;
		}
		if(!this.asyn){
			this.end()
		}
	}
	var end = function(){
		if(this.status == 'waiting'){
			this.status = 'success';
		}
		statusChange.call(this);
	}
	fail = function(why){
		this.status = 'fail';
		this.failCase ++;
		this.errorMessage += why + '\n'
		statusChange.call(this);
	}
	var test = function(value, why){
		if(!value){
			fail.call(this, why);
		}else{
			this.succCase ++;
			if(this.succCase == this.expectCase)
				this.status = 'success';
			statusChange.call(this);
		}
	}
	var log = function(txt){
		console.log(txt);
	}
	window.testCases.errorBox=[];
	window.onerror = function(txt,line,no){
		var errorObject = {
			message:txt,
			lineNumber:no
		}
		window.testCases.errorBox.push(errorObject);
		if(targetWindow.onNewError){
			targetWindow.onNewError(errorObject);
		}
	}
	window.test = function(name, run, asyn){
		var newCase = getNewCase(name, run, asyn)
		if(targetWindow && targetWindow.onNewCase){
			targetWindow.onNewCase(newCase);
		}else{
			window.testCases.push(newCase);
		}
	}
})();