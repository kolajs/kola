/**
 * kola language 包，提供JS语言中常见数据类型的常用方法
 * 
 * @module kola.lang
 */

kola('kola.lang.Class', [
	'kola.Packager'
], function (Packager) {

	/********************************************** 类定义 **********************************************/

	/**
	 * kola的Class类，用于类的创建和检测等
	 * 
	 * @class Class
	 * @static
	 * 
	 * @author Jady Yang
	 */
	
	var exports = {
		
		/**
		 * 创建一个新类
		 * 
		 * @method createClass
		 * @param [superClass] {Class} 父类
		 * @param methods {Object} 方法列表
		 * @return {Class}
		 */
		create: Packager.createClass,
	
		/**
		 * 测试对象是否为函数
		 * @method isFunction
		 * @param target {Object} 目标对象
		 * @return {Boolean}
		 */
		isFunction: function (target) {
			return (eye.call(target) == "[object Function]");
		},
	
		/**
		 * 测试对象是否为函数
		 * @method isArray
		 * @param target {Object} 目标对象
		 * @return {Boolean}
		 */
		isArray: function (target) {
			return (eye.call(target) == "[object Array]");
		},
	
		/**
		 * 测试对象是否为字符串
		 * @method isString
		 * @param target {Object} 目标对象
		 * @return {Boolean}
		 */
		isString: function (target) {
			return (eye.call(target) == "[object String]");
		},
	
		/**
		 * 测试对象是否为正则表达式
		 * @method isRegExp
		 * @param target {Object} 目标对象
		 * @return {Boolean}
		 */
		isRegExp: function (target) {
			return (eye.call(target) == "[object RegExp]");
		},
	
		/**
		 * 测试对象是否为数字
		 * @method isNumber
		 * @param target {Object} 目标对象
		 * @return {Boolean}
		 */
		isNumber: function (target) {
			return (eye.call(target) == "[object Number]");
		},
	
		/**
		 * 测试对象是否未定义
		 * @method isUndefined
		 * @param target {Object} 目标对象
		 * @return {Boolean}
		 */
		isUndefined: function (target) {
			return (typeof target == "undefined");
		},
	
		/**
		 * 测试对象类型的函数
		 * @property eye
		 * @type {Function}
		 * @private
		 */
		eye: Object.prototype.toString
		
	};
	
	return exports;
});