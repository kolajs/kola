kola('kola.lang.Function', null, function() {
	
	var slice = Array.prototype.slice;
	
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
		 * @param context {Any} 方法执行时的this
		 * @param [argument]* {Any} 要绑定的参数
		 * @return {Function} 创建的新Function
		 */
		bind: function(target, context) {
			var args = slice.call(arguments, 2);
			return function() {
				return target.apply(context, args.concat(slice.call(arguments)));
			};
		},
		
		/**
		 * 设置方法在多少秒之后执行，并可以绑定执行时的this和参数
		 * 
		 * @method timeout
		 * @param target {Function} 被绑定的方法
		 * @param second {Number} 秒数
		 * @param [context] {Any} 方法执行时的this
		 * @param [argument]* {Any} 要绑定的参数
		 * @return {Function} 创建的新Function
		 */
		timeout: function(target, second, context) {
			var args = slice.call(arguments, 3);
			return window.setTimeout(function() {
				target.apply(context, args)
			}, second);
		},
		
		/**
		 * 设置方法在多少秒循环执行一次，并可以绑定执行时的this和参数
		 * 
		 * @method interval
		 * @param target {Function} 被绑定的方法
		 * @param second {Number} 秒数
		 * @param [context] {Any} 方法执行时的this
		 * @param [argument]* {Any} 要绑定的参数
		 * @return {Function} 创建的新Function
		 */
		interval: function(target, second, context) {
			var args = slice.call(arguments, 3);
			return window.setInterval(function() {
				target.apply(context, args)
			}, second);
		},
		
		/**
		 * 可被全局使用的空函数
		 * 
		 * @property empty
		 * @type {Function}
		 */
		empty: function() {},

		/**
		 * 创建一个新方法，返回指定的值
		 * 
		 * @method value
		 * @param value {Any} 要被返回的值
		 * @return {Function}
		 */
		value: function(value) {
			return function() {
				return value;
			};
		}
	};
	
	return exports;	
});