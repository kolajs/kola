/**
 * kola language 包，提供JS语言中常见数据类型的常用方法
 * 
 * @module kola.lang
 */

kola('kola.lang.Object', [
	'kola.lang.Class'
], function (KolaClass) {
	/**
	 * kola的Object类
	 * 
	 * @class Object
	 * @static
	 * 
	 * @author Jady Yang
	 */
	var exports = {
		/**
		 * 对象的属性继承
		 * @method extend
		 * @param [deep] {Boolean} 是否需要深度拷贝，可选项
		 * @param target {Object} 目标对象
		 * @param src* {Object} 源对象
		 * @return {Object} 目标对象
		 */
		extend: function(target) {

				var options, name, src, copy, copyIsArray, clone,
					i = 1,
					length = arguments.length,
					deep = false;
			
				//是否需要深度复制对象
				if ( typeof target === "boolean" ) {
					deep = target;
					target = arguments[1] || {};
					i = 2;
				}
			
				if ( typeof target !== "object" && !KolaClass.isFunction(target) ) {
					target = {};
				}
			
				if ( length === i ) {
					target = {};
					--i;
				}
			
				for ( ; i < length; i++ ) {
					if ( (options = arguments[ i ]) != null ) {
						for ( name in options ) {
							src = target[ name ];
							copy = options[ name ];

							if ( target === copy ) {
								continue;
							}
			
							if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = KolaClass.isArray(copy)) ) ) {
								if ( copyIsArray ) {
									copyIsArray = false;
									clone = src && KolaClass.isArray(src) ? src : [];
			
								} else {
									clone = src && isPlainObject(src) ? src : {};
								}
								target[ name ] = this.extend( deep, clone, copy );
							} else if ( copy !== undefined ) {
								target[ name ] = copy;
							}
						}
					}
				}
			
				return target;
		},
		/**
		 * 得到对象的属性集合
		 * @method keys
		 * @param target {Object} 目标对象
		 * @return {Array}
		 */
		keys: function (target) {
			var keys = [];
			for(key in target){
				if(target.hasOwnProperty(key)){
					keys.push(key);
				}
			}
			return keys
		}
	};
	var isPlainObject = function( obj ) {
		if (!obj || !KolaClass.isObject(obj) || obj.nodeType) {
			return false;
		}

		if ( obj.constructor &&
			!obj.hasOwnProperty("constructor") &&
			!obj.constructor.prototype.hasOwnProperty("isPrototypeOf") ) {
			return false;
		}

		var key;
		for (key in obj) {}

		return key === undefined || obj.hasOwnProperty(key);
	}
	return exports;
});