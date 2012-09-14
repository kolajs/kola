
kola('kola.lang.String', null, function() {
	
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
		 * 去除掉字符串左右两侧、连续的空格
		 * 
		 * @method trim
		 * @param target {String} 要过滤空格的字符串
		 * @return {String} 
		 */
		trim: function(target) {
			return target.replace(trimLeft, '').replace(trimRight, '');
		},
		
		/**
		 * 去除掉字符串左侧开始的、连续的空格
		 * 
		 * @method trimLeft
		 * @param target {String} 要过滤空格的字符串
		 * @return {String}
		 */
		trimLeft: function(target) {
			return target.replace(trimLeft, '');
		},
		
		/**
		 * 去除掉字符串右侧开始的、连续的空格
		 * 
		 * @method trimRight
		 * @param target {String} 要过滤空格的字符串
		 * @return {String}
		 */
		trimRight: function(target) {
			return target.replace(trimRight, '');
		}
	};
	
	// 使用这种正则的原因参考：http://blog.stevenlevithan.com/archives/faster-trim-javascript
	var trimLeft = /^\s\s*/;
	var trimRight = /\s\s*$/;
	
	return exports;
});