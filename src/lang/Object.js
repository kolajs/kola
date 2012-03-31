/**
 * @fileOverview kola.lang.Object类
 * @author Jady Yang
 */

kola('kola.lang.Object', 
null, 
function() {
	
	var exports = {
		
		/**
		 * 属性继承方法
		 * @param {Object} target 目标对象
		 * @param {Object} src 源对象
		 * @return 目标对象
		 * @type Object
		 */
		extend: function(target, src) {
			for (var name in src) {
				target[name] = src[name];
			}
			return target;
		}
		
	};
	
	return exports;
	
});