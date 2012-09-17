kola('kola.lang.Object', null, function() {
	
	var slice = Array.prototype.slice;
	var toString = Object.prototype.toString;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	
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
		 * 把源对象上的属性都复制到目标对象上，如果没有源对象，那就是要把目标对象复制一份
		 * 
		 * @method extend
		 * @param [deep] {Boolean} 是否需要深度拷贝，可选项
		 * @param target {Object} 目标对象
		 * @param [src]* {Object} 源对象
		 * @return {Object} 目标对象
		 */
		extend: function() {
			// 实现参考自jQuery 1.8.0，thanks
			var options, name, src, copy, copyIsArray, clone,
				args = slice.call(arguments),
				target = args[0],
				i = 1,
				length = args.length,
				deep = false;
		
			// 判断是否是深度复制
			if (typeof target === "boolean") {
				deep = target;
				target = args[1];
				i = 2;
			}
			
			// 如果没有要复制的对象，那就是要把自己复制一份
			// 这里跟jQuery的实现是不同的
			if (length === i) {
				args[length++] = target;
				
				if (exports.isPlainObject(copy)) {
					// 是PlainObject就创建一个空的Object对象
					target = {};
				} else if (copyIsArray = toString.call(copy) == '[Object Array]') {
					// 是Array，那就创建空的Array对象
					target = [];
				} else {
					// 其他情况直接返回
					return target;
				}
			}
		
			// 循环每个对象，进行复制
			for (; i < length; i++) {
				// 如果是null或undefined则不处理
				if ((options = args[i]) == null) continue;
				
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];
	
					// 放置在同一对象上做无谓循环
					if (target === copy) continue;
	
					// 判断是否需要深度复制
					if (deep && copy 
						&& (exports.isPlainObject(copy) 
							|| (copyIsArray = toString.call(copy) == '[Object Array]'))
					) {
						// 对PlainObject和Array类型进行深度复制
						
						if (copyIsArray) {
							clone = src && toString.call(src) == '[Object Array]' ? src : [];
						} else {
							clone = src && exports.isPlainObject(src) ? src : {};
						}
	
						// 进行深度复制
						target[name] = exports.extend(deep, clone, copy);
	
					} else {
						// 这里与jQuery不同
						// jQuery中，如果是undefined就不复制，但在这里是复制的
						// 这里针对undefined也会复制，主要是基于复制与否对或者这个值没有影响，但是对于调用hasOwnProperty是有差别的，因此尽量保持一致
						target[name] = copy;
					}
				}
			}
		
			return target;
		},
		
		/**
		 * 得到对象的属性名集合
		 * @method keys
		 * @param target {Object} 目标对象
		 * @return {Array}
		 */
		keys: function(target) {
			var keys = [];
			for (var key in target) {
				if (target.hasOwnProperty(key)) {
					keys.push(key);
				}
			}
			return keys;
		},
		
		/**
		 * 判断给定的对象是Object类型，并且不是null
		 * 
		 * @method notNull
		 * @param target {Any} 要判断的对象
		 * @return {Boolean}
		 */
		notNull: function(target) {
			return typeof target == 'object' && target !== null;
		},
		
		/**
		 * 判断指定对象是不是一个PlainObject。
		 * PlainObject就是采用new Object()或者{}方式产生的Object。
		 * 
		 * @method isPlainObject
		 * @param target {Any} 要判断的对象
		 * @return {Boolean}
		 */
		isPlainObject: function(target) {
			// 实现参考自jQuery 1.8.0， thanks
			
			// 先判断基本数据类型
			if (!target || toString.call(target) !== '[object Object]' 
				|| target.nodeType 	// IE旧版本下，Class.type(element) == '[object Object]'
				|| target == target.window  // 刨除掉window
			) {
				return false;
			}
			
			// 判断是否是继承过来的
			try {
				// Not own constructor property must be Object
				if (target.constructor &&
					!hasOwnProperty.call(target, "constructor") &&
					!hasOwnProperty.call(target.constructor.prototype, "isPrototypeOf")
				) {
					return false;
				}
			} catch (e) {
				// IE8,9 Will throw exceptions on certain host objects #9897
				return false;
			}
			
			// 通过第一个属性快速校验
			var key;
			for (key in target) {}

			return key === undefined || hasOwnProperty.call(target, key);
		}
	};
	
	return exports;
});