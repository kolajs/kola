/**
 * @fileOverview kola.net.Ajax Ajax类
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.net.Ajax',[
	'kola.lang.Function',
	'kola.lang.Array'
],function(KolaFunction, KolaArray) {
	/********************************************** 类定义 **********************************************/
	/**
	 * Ajax类
	 * @class Ajax
	 * @static
	 */
	var Ajax = {
		/**
		 * @method request {XMLHttpRequest}
		 * @param url {String} 请求的地址，可以是绝对路径或者相对于host的路径
		 * @param [options] {Object} 选项
			 * @param [options.data] {Object} 发送的数据
			 * @param [options.format] {String} json|text|xml请求的method
			 * @param [options.method] {Object} 请求的method
			 * @param [options.scope] {Object} 成功和失败回调的作用域
			 * @param [options.async] {Boolean} 是否为异步请求
			 * @param [options.succ] {Function} 成功的回调函数
			 * @param [options.fail] {Function} 失败的回调函数
			 * @param [options.headers] {Object} 发送请求时额外的headers
		 */
		request: function(url, options) {
			var method = (options.method || 'get').toLowerCase();
			var	data = options.data;
			
			//	解析data，并进行相应的处理
			var addDefaultHeader = true;
			if (typeof data == 'object' && data !== null) {
				if (window.FormData && data instanceof window.FormData) {
					addDefaultHeader = false;
				} else {
					var str = "";
					var first = true;
					for(key in data){
						if(first){
							first = false;
							str += key + "=" + data[key];
						}else{
							str += "&" + key + "=" + data[key];
						}
					}
					data = str;
				}
			}
			// 如果以/开头，则认为是当前域
			if(url.indexOf("/") == 0){
				url=window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "") + url;
			}
			//	如果method只能通过url传递参数，那就放到url上
			if ((method == 'get' || method == 'delete' || method == 'put') && typeof(data) == 'string' ) {
				url += (url.indexOf('?') == -1 ? '?' : '&') + data;
			}

			//	获取原生Ajax
			var trans = getTransport(url);

			//	打开Ajax
			trans.open(method, url, options.async || true);

			//	设置headers
			var headers = options.headers || {};
			if (addDefaultHeader && method == 'post' && !headers['Content-Type']) {
				headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
			}
			for (var name in headers) {
				var value = headers[name];
				if (typeof value != 'string') continue;
				trans.setRequestHeader(name, value);
			}

			//	设置ajax的跟踪事件
			trans.onreadystatechange = KolaFunction.bind(stateChange, null, trans, url, options);

			//	发送数据
			trans.send(data);

			return trans;
		},

		text: function(url, options) {
			options = options || {};
			options.format = 'text';
			return this.request(url, options);
		},

		json: function(url, options) {
			options = options || {};
			options.format = 'json';
			return this.request(url, options);
		},

		xml: function(url, options) {
			options = options || {};
			options.format = 'xml';
			return this.request(url, options);
		},
		/**
		 * @param url {String} 
		 * @param [data] {Object}
		 * @param [succ] {Function}
		 * @param [fail] {Function}
		 * @param [scope] {Object}
		 */
		get: function(url, data, succ, fail, scope) {
			options.method = 'get';
			if(typeof data == 'function'){
				data = null
				succ = data;
				options = succ;
			}
			options = options || {};
			options.succ = succ;
			return this.request(url, options);
		},
		post: function(url, options) {
			options = options || {};
			options.method = 'post';
			return this.request(url, options);
		}
	};
	KolaArray.forEach('get,post'.split(','),function(functionName){

	});
	/********************************************** 私有方法 **********************************************/
	function stateChange(trans, options) {
		if (trans.readyState == 4) {
			trans.onreadystatechange = function() {};
			var status = trans.status;

			if ((typeof(status) == 'number') && status >= 200 && status < 300) {
				if (typeof(options.succ) != 'function') return;

				var ctt = trans;
				if (typeof(options.format) == 'string') {
					switch(options.format) {
						case 'text':
							ctt = trans.responseText;
							break;
						case 'json':
							if(trans.responseText)
								ctt = eval('(' + trans.responseText + ')');
							break;
						case 'xml':
							ctt = trans.responseXML;
							break;
					}
				}
				options.succ.call(options.scope, ctt);
			} else {
					if (typeof(options.fail) == 'function') {
					var error = {
						status: trans.status,
						statusText: trans.statusText,
						data:trans.responseText
					};
					
					//  判断是否是网络断线或者根本就请求不到服务器
					if (trans.readyState == 4 && (trans.status == 0 || trans.status == 12030)) {
						//  是
						error.status = -1;
					}
					if (typeof(options.format) == 'string') {
						switch(options.format) {
							case 'json':
								error.data = eval('(' + trans.responseText + ')');
								break;
							case 'xml':
								error.data = trans.responseXML;
								break;
						}
					}
					options.fail.call(options.scope, error);
				}
			}
		}
	}
	/**
	 * 获取原生的Ajax
	 */
	var getTransport = function() {
		if (window.XMLHttpRequest) return new XMLHttpRequest();
		else {
			try {
				return new ActiveXObject('Msxml2.XMLHTTP');
			} catch (e) {
				try {
					return new ActiveXObject('Microsoft.XMLHTTP');
				} catch (e) {
					return false;
				}
			}
		}
	};

	/********************************************** 返回类 **********************************************/

	return Ajax;

});