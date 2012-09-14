kola('kola.lang.Class', [
	'kola.Packager'
], function(Packager) {

	/********************************************** 类定义 **********************************************/
	
	var toString = Object.prototype.toString;

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
		 * @param [superClass] {Function} 父类
		 * @param prototypes {Object} 原形对象
		 * @return {Class} 创建的新类
		 */
		create: Packager.createClass,
		
		/**
		 * 获得指定对象的类型
		 * 
		 * @method type
		 * @param target {Any} 要判断的对象
		 * @retrun {String} 类似于这样的值：undefined、null、Object、String、Boolean、Array、HTMLElement...
		 */
		type: function(target) {
			if (target == null) return String(target);
			
			// 如果是Object子类的话，那就再具体判断是什么类型
			var typeString = toString.call(target);
			if (typeString.indexOf('[object ') == 0) {
				return typeString.substring(8, typeString.length - 1);
			}
			
			return typeString;
		}
	};
	
	return exports;
});