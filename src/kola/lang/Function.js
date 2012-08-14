/**
 * kola language 包，提供JS语言中常见数据类型的常用方法
 * 
 * @module kola.lang
 */

kola('kola.lang.Function', [
], function () {
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

	return exports;	
});