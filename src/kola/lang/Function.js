/**
 * kola language 包，提供JS语言中常见数据类型的常用方法
 * 
 * @module kola.lang
 */

kola('kola.lang.Function', null, function() {
	
	/********************************************** 类定义 **********************************************/
	
	/**
	 * kola的Function类，提供的方法和实现遵循ECMA-262的规范
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
		 * @param callbackfn {Function} 被绑定的方法
		 * @param thisArg {Any} 方法执行时的this
		 * @param [arg]* {Any} 要绑定的参数
		 * @return {Function} 创建的新Function
		 */
		bind: function(callbackfn, thisArg) {
			var args = [];
			for (var i = 2, il = arguments.length; i < il; i ++) {
				args.push(arguments[i]); 
			}
			return function() {
				var newArgs = args.concat();
				for (var i = 0, il = arguments.length; i < il; i ++) {
					newArgs.push(arguments[i]);
				}
				return callbackfn.apply(thisArg, newArgs);
			};
		},

		/**
		 * 可被全局使用的空函数
		 * 
		 * @method empty
		 */
		empty: function() {},

		/**
		 * 创建一个新方法，返回指定的值
		 * 
		 * @method x
		 * @param value {Any} 要返回的值
		 * @return {Function}
		 */
		x: function(value) {
			return function() {
				return value;
			};
		}
	};
	
	return exports;
	
});