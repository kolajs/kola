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
	/**
	 * 创建一个新类
	 * 
	 * @method createClass
	 * @param [superClass] {Class} 父类
	 * @param methods {Object} 方法列表
	 * @return {Class}
	 */
	var exports = Packager.createClass;
	/**
	 * 测试对象类型的函数
	 * @property eye
	 * @type {Function}
	 * @private
	 */
	var eye = Object.prototype.toString;
	/**
	 * 测试对象是否为函数
	 * @method isFunction
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isFunction = function (target) {
		return (eye.call(target) == "[object Function]");
	};

	/**
	 * 测试对象是否为函数
	 * @method isArray
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isArray = function (target) {
		return (eye.call(target) == "[object Array]");
	};
	/*
	 * 测试对象是否为对象
	 * @method isObject
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	// FIXME: isObject需要确定，你认为什么是object？使用者认为什么是object？你跟使用者认为的是否一致？是否会产生歧义？
	// FIXME: 没有考虑为null的情况，null在ie低版本下会认为是 [object Object]，其他情况会认为是[object Null]
	// FIXME: 还有很多种情况，比如 document.toString是 [object HTMLDocument]（非IE低版本浏览器）等等，尤其是在对象为dom的情况下
	exports.isObject = function (target) {
		return (eye.call(target) == "[object Object]");
	};
	/**
	 * 测试对象是否为字符串
	 * @method isString
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isString = function (target) {
		return (eye.call(target) == "[object String]");
	};

	/**
	 * 测试对象是否为正则表达式
	 * @method isRegExp
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isRegExp = function (target) {
		return (eye.call(target) == "[object RegExp]");
	};

	/**
	 * 测试对象是否为数字
	 * @method isNumber
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isNumber = function (target) {
		return (eye.call(target) == "[object Number]");
	};

	/**
	 * 测试对象是否未定义
	 * @method isUndefined
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isUndefined = function (target) {
		return (typeof target=="undefined");
	};
	
	return exports;
});