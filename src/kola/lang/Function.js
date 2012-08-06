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
		 * 给方法添加前置任务，只有当所有前置任务都执行过回调之后，方法才会被执行
		 * @method pretask
		 * @param {Function} callback 需要添加前置任务的方法
		 * @param {Array<Object> | Object | Function} [pretasks] 前置任务数组，如果只有一个，则可以直接使用下级object
		 * 		@param {Object | Function} [pretasks[i]] 前置任务描述，如果param、scope都省略，则可以直接写fn
		 *			@param {Function} [pretasks[i].fn] 前置任务函数
		 *			@param {Function} [pretasks[i].param] 前置任务函数的执行附加参数
		 *			@param {Function} [pretasks[i].scope] 前置任务函数的执行scope
		 * @return {Function} 创建的新Function
		 */
		pretask: function(callback,pretasks){
			if(!KolaObject.isArray(pretasks))
				pretasks = [pretasks];
			return function(){
				var _this=this;
				for(var i=0;i<pretasks.length;i++){
					var pretask = pretasks[i];
					if(KolaObject.isFunction(pretask)){
						pretask = {fn:pretask}
					}
					var args=arguments
					pretask.finished = false;
					pretask.param = pretask.param||[];
					pretask.param.unshift(function(){
						pretaskComplete(pretasks, pretask, callback, _this, args);
					});
					pretask.fn.apply(pretask.scope || _this, pretask.param);
				}
			}
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