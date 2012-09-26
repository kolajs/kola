kola('kola.lang.Class', [
	'kola.Packager'
], function(Packager) {

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
		 * @param [superClass] {Function} 父类
		 * @param prototypes {Object} 原形对象
		 * @return {Class} 创建的新类
		 */
		create: Packager.createClass
	};
	
	return exports;
});