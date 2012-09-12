kola('kola.lang.Function', [
	'kola.lang.Class'
], function (KolaClass) {
	/**
	 * kola的Function类
	 * 
	 * @class Function
	 * @static
	 * 
	 * @author Jady Yang
	 */
	var exports = {
		
		/**
		 * 给方法绑定this和参数，而且这些参数排在方法被调用时所传入的参数之前
		 * 
		 * @method bind
		 * @param target {Function} 被绑定的方法
		 * @param scope {Any} 方法执行时的this
		 * @param [bindArgs]* {Any} 要绑定的参数
		 * @return {Function} 创建的新Function
		 */
		bind: function (target, scope) {
			var bindArgs = [];
			for (var i = 2, il = arguments.length; i < il; i ++) {
				bindArgs.push(arguments[i]); 
			}
			return function () {
				var newArgs = bindArgs.concat();
				for (var i = 0, il = arguments.length; i < il; i ++) {
					newArgs.push(arguments[i]);
				}
				return target.apply(scope, newArgs);
			};
		},
		
		/**
		 * 给方法绑定this和参数，而且这些参数排在方法被调用时所传入的参数之前
		 * 
		 * @method overload
		 * @param [description] {String} 函数的参数描述如"String,Any,Function,Object"
		 * @param handler {Function} 重载函数
		 * @param [description] {String} 函数的参数描述如"String,Any,Function,Object"
		 * @param handler {Function} 重载函数
		 * *****
		 * ***
		 * *
		 * @return {Function} 重载后的函数
		 */
		overload: function(){
			var handlers = initOverloadArguments(arguments);
			return function(){
				var handler = handlers[arguments.length];
				if(handler){
					for(i = 0; i < handler.length; i++){
						if(!handler[i].description || compareArguments(handler[i].description, arguments)){
							return handler[i].handler.apply(this, arguments)
						}
					}
				}
				throw("No matched arguments in overload function!")
			}
		},
		
		/**
		 * 可被全局使用的空函数
		 * 
		 * @property empty
		 * @type {Function}
		 *		@return {Undefined}
		 */
		empty: function () {},

		/**
		 * 创建一个新方法，返回指定的值
		 * 
		 * @method value
		 * @param value {Any} 要返回的值
		 * @return {Function}
		 */
		value: function (value) {
			return function() {
				return value;
			};
		}
	};
	
	/*
	 * 比较描述与函数参数实际是否相符
	 * 
	 * @method compareArguments
	 * @private
	 * @param description {Array<String>} 参数的描述
	 * @param arguments {Object} 函数的实际参数
	 * @return {Boolean}
	 */
	function compareArguments(description, arguments){
		for(var i = 0; i < description.length; i++){
			if(description[i] != "Any" && Object.prototype.toString.call(arguments[i]).indexOf(description[i]) == -1)
				return false;
		}
		return true;
	}
	function initOverloadArguments(arg){
		var handlers = [];
		for(var i = 0; i < arg.length; i++){
			if(KolaClass.isString(arg[i])){//带描述的处理函数
				var description = arg[i++].split(",");
				var handler = handlers[description.length] || (handlers[description.length] = []);
				handler.push({description: description, handler: arg[i]});
			}else{//不带描述，直接以处理函数参数长度作为重载依据
				var handler = handlers[arg[i].length] || (handlers[arg[i].length] = []);
				handler.push({handler: arg[i]});
			}
		}
		return handlers;
	}
	return exports;	
});