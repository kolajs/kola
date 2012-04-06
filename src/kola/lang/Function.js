/**
 * @fileOverview kola.lang.Function Function类
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.lang.Function', 
	null, 
	function() {
	
	/********************************************** 类定义 **********************************************/
	
	var func= {
		
		/**
		 * 给方法绑定this和参数，而且这些参数排在方法被调用时所传入的参数之前
		 * @param {Function} callbackfn 被绑定的方法
		 * @param {ANY} thisArg 方法执行时的this
		 * @param {ANY} arg1 要绑定的参数1
		 * @param {ANY} arg2 要绑定的参数2
		 * @param {ANY} argN 要绑定的参数N
		 * @return 绑定过之后的新方法
		 * @type Function
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
		 * 给方法绑定this和参数，而且这些参数排在方法被调用时所传入的参数之后
		 * @param {Function} callbackfn 被绑定的方法
		 * @param {ANY} thisArg 方法执行时的this
		 * @param {ANY} arg1 要绑定的参数1
		 * @param {ANY} arg2 要绑定的参数2
		 * @param {ANY} argN 要绑定的参数N
		 * @return 绑定过之后的新方法
		 * @type Function
		 */
		bindAfter: function(callbackfn, thisArg) {
			var args = [];
			for (var i = 2, il = arguments.length; i < il; i ++) {
				args.push(arguments[i]); 
			}
			return function() {
				var newArgs = args.concat();
				for (var i = arguments.length - 1; i >= 0; i --) {
					newArgs.unshift(arguments[i]);
				}
				return callbackfn.apply(thisArg, newArgs);
			};
		},

		/**
		 * 可被全局使用的空函数
		 */
		empty: function() {},

		/**
		 * 返回一个新方法，用于返回指定的一个值
		 * @param value
		 */
		x: function( value ) {
			return function() {
				return value;
			};
		}
	};
	
	return func;
	
});