/**
 * kola language 包，提供JS语言中常见数据类型的常用方法
 * 
 * @module kola.lang
 */

kola('kola.lang.String', [
], function () {
	/**
	 * kola的String类
	 * 
	 * @class String
	 * @static
	 * 
	 * @author Jady Yang
	 */
	var exports = {
		/**
		 * 去除掉字符串左右两侧的空格
		 * 
		 * @method trim
		 * @param string {String} 要过滤空格的字符串
		 * @return {String}
		 */
		trim: function(string) {
			return string.replace(trimLeft, '').replace(trimRight, '');
		}
	};
	/**
	 * @private
	 * @proprety trimLeft
	 */
	var trimLeft = /^\s\s*/;
	var trimRight = /\s\s*$/;
	return exports;
});