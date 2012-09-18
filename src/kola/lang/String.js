
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
		},
		
		/**
		 * 判断某字符串是否以指定字符串开头
		 * 
		 * @method startsWith
		 * @param target {String} 被判断的字符串
		 * @param it {String} 被检测的字符串
		 * @return {Boolean}
		 */
		startsWith: function(target, it) {
			return target.indexOf(it) == 0;
		},
		
		/**
		 * 判断某字符串是否以指定字符串结尾
		 * 
		 * @method startsWith
		 * @param target {String} 被判断的字符串
		 * @param it {String} 被检测的字符串
		 * @return {Boolean}
		 */
		endsWith: function(target, it) {
			var length = it.length;
			return target.length >= length && target.substr(-length) == it;
		},
		
		/**
		 * 判断某字符串是否包含指定的字符串
		 * 
		 * @method contains
		 * @param target {String} 被判断的字符串
		 * @param it {String} 被检测的字符串
		 * @return {Boolean}
		 */
		contains: function(target, it) {
			return target.indexOf(it) != -1;
		}
	};
	
	// 使用这种正则的原因参考：http://blog.stevenlevithan.com/archives/faster-trim-javascript
	var trimLeft = /^\s\s*/;
	var trimRight = /\s\s*$/;
	
	return exports;
});