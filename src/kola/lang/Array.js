/**
 * 增强JS基本数据类型的功能
 * 
 * @module kola.lang
 */

kola('kola.lang.Array', null, function() {
	
	/**
	 * 保存原生的slice方法
	 */
	var slice = Array.prototype.slice;
	var hasOwnProperty = Object.prototype.hasOwnProperty
	/**
	 * 仅给方法绑定context
	 */
	var bindContext = function(fn, context) {
		return function() {
			return fn.apply(context, arguments);
		};
	};
	
	// 仅在IE9一下不支持这些方法，剩余的浏览器和版本都已经部分支持
	var userAgent = navigator.userAgent;
	var partialSupport = userAgent.indexOf('MSIE') == -1 
		|| parseInt(userAgent.substr(userAgent.indexOf('MSIE') + 5, 3 )) >= 9;
	
	/**
	 * 获得指定名称的完全替代方法
	 */
	var supported = function(name) {
		return function(target) {
			return Array.prototype[name].apply(target, slice.call(arguments, 1));
		};
	};
	
	/**
	 * 获得指定名称的部分替代方法
	 */
	var supportedButContext = function(name) {
		return function(target, callback, context) {
			return Array.prototype[name].call(target, arguments.length > 2
				? bindContext(callback, context)	// 存在context的话，那建立一个设置了this的新方法
				: callback);
		};
	};
	
	var isArray = partialSupport ? Array.isArray 
		: function(target) {
			if (typeof target != 'object' || target === null) return false;
			return Object.prototype.toString.call(target) == '[object Array]';
		};
	
	/**
	 * kola的Array类
	 * 
	 * @class Array
	 * @static
	 * 
	 * @author Jady Yang
	 */
	var exports = {
		
		/**
		 * 获取指定元素在数组中的位置
		 * 
		 * @method indexOf
		 * @param target {LikeArray} 被搜索的数组
		 * @param searchElement {Any} 要搜索的元素
		 * @param [fromIndex] {Number} 开始位置。如果不是数字的话，则表示从0开始；如果是负数，那就表示从倒数第几个开始。
		 * @return {Number} 搜索到的位置，如果没有则返回-1
		 */
		indexOf: partialSupport ? supported('indexOf') 
			: function(target, searchElement, fromIndex) {	
				//	如果数组长度为0，那就返回-1
				var length = target.length;
				if (length) {
					//	拿到起始位置
					fromIndex = typeof(fromIndex) == 'number' 
						? fromIndex >= 0
							? fromIndex
							:  Math.max(length + fromIndex, 0)
						: 0;
								
					//	从起始位置开始，寻找元素
					for (var i = fromIndex, il = length; i < il; i++) {
						if (hasOwnProperty.call(target, i.toString())
							&& target[i] === searchElement
						) {
							return i;
						}
					}
				}
				return -1;
			},
		
		/**
		 * 在数组中从后往前搜索指定元素的位置
		 * 
		 * @method lastIndexOf
		 * @param target {LikeArray} 被搜索的数组
		 * @param searchElement {Any} 要搜索的元素
		 * @param [fromIndex] {Number} 开始位置。如果不是数字的话，则表示从0开始；如果是负数，那就表示从倒数第几个开始。
		 * @return {Number} 搜索到的位置，如果没有则返回-1
		 */
		lastIndexOf: partialSupport ? supported('lastIndexOf') 
			: function(target, searchElement, fromIndex) {
				//	如果数组长度为0，那就返回-1
				var length = target.length;
				if (length) {
					//	拿到起始位置
					fromIndex = typeof(fromIndex) == 'number' 
						? fromIndex >= 0
							? fromIndex
							: Math.max(length + fromIndex, 0)
						: length - 1;
					
					//	从起始位置开始，寻找元素
					for (var i = fromIndex; i >= 0; i--) {
						if (hasOwnProperty.call(target,i.toString())
							&& target[i] === searchElement
						) {
							return i;
						}
					}
				}
				
				return -1;
			},
		
		/**
		 * 循环数组中的每一项，依次交给迭代器，确认所有的返回值等价于true，才会返回true，其他情况返回false
		 * 
		 * @method every
		 * @param target {LikeArray} 要循环的数组
		 * @param callback {Function} 迭代器。其接受三个参数：
		 * 		item {Any} 数组当前项；
		 * 		i {Number} 在数组中的位置；
		 * 		target {LikeArray} 数组对象；
		 * @param [context] {Any} 给迭代器设置的上下文。如果不存在的话，那就是当前环境对象（浏览器中一般为window）
		 * @return {Boolean} 返回值
		 */
		every: partialSupport ? supportedButContext('every') 
			: function(target, callback, context) {
				for (var i = 0, il = target.length; i < il; i++) {
					if (hasOwnProperty.call(target,i.toString())
						&& !callback.call(context, target[i], i, target)
					) {
						return false;
					}
				}
				return true;
			},
		
		/**
		 * 循环数组中的每一项，依次交给迭代器，如果存在返回值等价于true，那就返回true，其他情况返回false
		 * 
		 * @method some
		 * @param target {LikeArray} 要循环的数组
		 * @param callback {Function} 迭代器。其接受三个参数：
		 * 		item {Any} 数组当前项；
		 * 		i {Number} 在数组中的位置；
		 * 		target {LikeArray} 数组对象；
		 * @param [context] {Any} 给迭代器设置的上下文。如果不存在的话，那就是当前环境对象（浏览器中一般为window）
		 * @return {Boolean} 返回值
		 */
		some: partialSupport ? supportedButContext('some') 
			: function(target, callback, context) {
				for (var i = 0, il = target.length; i < il; i++) {
					if (hasOwnProperty.call(target,i.toString())
						&& callback.call(context, target[i], i, target)
					) {
						return true;
					}
				}
				return false;
			},
		
		/**
		 * 从前往后迭代数组中的每一项，并可以设置迭代器的context
		 * 
		 * @method forEach
		 * @param target {LikeArray} 要循环的数组
		 * @param callback {Function} 迭代器。其接受三个参数：
		 * 		item {Any} 数组当前项；
		 * 		i {Number} 在数组中的位置；
		 * 		target {LikeArray} 数组对象；
		 * @param [context] {Any} 给迭代器设置的上下文。如果不存在的话，那就是当前环境对象（浏览器中一般为window）
		 */
		forEach: partialSupport ? supportedButContext('forEach') 
			: function(target, callback, context) {
				for (var i = 0, il = target.length; i < il; i++) {
					hasOwnProperty.call(target,i.toString())
						&& callback.call(context, target[i], i, target);
				}
			},
		
		/**
		 * 从前往后迭代数组中的每一项，交给迭代器执行。
		 * 当迭代器的返回值完全等于false时，就会停止循环。
		 * 最后的返回值代表，是否没有任何中断（数组最后一项中断也算是中断）。
		 * 
		 * @method each
		 * @param target {LikeArray} 要循环的数组
		 * @param callback {Function} 迭代器。其接受三个参数：
		 * 		item {Any} 数组当前项；
		 * 		i {Number} 在数组中的位置；
		 * 		target {LikeArray} 数组对象；
		 * @param [context] {Any} 给迭代器设置的上下文。如果不存在的话，那就是当前环境对象（浏览器中一般为window）
		 */
		each: function(target, callback, context) {
			for (var i = 0, il = target.length; i < il; i++) {
				if (hasOwnProperty.call(target,i.toString())
					&& callback.call(context, target[i], i, target) === false
				) {
					return false;
				} 
			}
			return true;
		},
		
		/**
		 * 循环数组中的每一项，依次交给迭代器，得到的每个返回值，依次装入得到一个新数组
		 * 
		 * @method map
		 * @param target {LikeArray} 要循环的数组
		 * @param callback {Function} 迭代器。其接受三个参数：
		 * 		item {Any} 数组当前项；
		 * 		i {Number} 在数组中的位置；
		 * 		target {LikeArray} 数组对象；
		 * @param [context] {Any} 给迭代器设置的上下文。如果不存在的话，那就是当前环境对象（浏览器中一般为window）
		 * @return {Array} 包含每次迭代结果的新数组
		 */
		map: partialSupport ? supportedButContext('map') 
			: function(target, callback, context) {
				var values = [];
				for (var i = 0, il = target.length; i < il; i++) {
					if (hasOwnProperty.call(target,i.toString())) {
						values[i] = callback.call(context, target[i], i, target);
					}
				}
				return values;
			},
		
		/**
		 * 循环数组中的每一项，依次交给迭代器，如果返回值等价于true，那就将该项存储到一个新数组中
		 * 
		 * @method filter
		 * @param target {LikeArray} 要循环的数组
		 * @param callback {Function} 迭代器。其接受三个参数：
		 * 		item {Any} 数组当前项；
		 * 		i {Number} 在数组中的位置；
		 * 		target {LikeArray} 数组对象；
		 * @param [context] {Any} 给迭代器设置的上下文。如果不存在的话，那就是当前环境对象（浏览器中一般为window）
		 * @return {Array} 过滤后的新数组
		 */
		filter: partialSupport ? supportedButContext('filter') 
			: function(target, callback, context) {
				var values = [];
				for (var i = 0, il = target.length; i < il; i++) {
					if (hasOwnProperty.call(target,i.toString())
						&& callback.call(context, target[i], i, target)
					) {
						values.push(target[i]);
					}
				}
				return values;
			},
		
		/**
		 * 从前向后循环数组中的每一项调用处理函数，前一项的结果交给后一项指导处理完成，将最后的结果返回
		 * 
		 * @method reduce
		 * @param target {LikeArray} 要循环的数组
		 * @param callback {Function} 迭代器。其接受四个参数：
		 * 		value {Any} 上个方法返回的值；
		 * 		item {Any} 当前项；
		 * 		i {Number} 在数组中的位置；
		 * 		target {LikeArray} 数组对象；
		 * @param [initialValue] {Any} 初始值
		 * @return {Any} 最后一次处理函数的调用结果
		 */
		reduce: partialSupport ? supported('reduce') 
			: function(target, callback, initialValue) {
				var noInitialValue = arguments.length < 3;
				for (var i = 0, il = target.length; i < il; i++) {
					if (hasOwnProperty.call(target,i.toString())) {
						if (noInitialValue) {
							noInitialValue = false;
							initialValue = target[i];
						} else {
							initialValue = callback(initialValue, target[i], i, target);
						}
					}
				}
				return initialValue;
			},
		
		/**
		 * 从后往前循环数组中的每一项调用处理函数，前一项的结果交给后一项指导处理完成，将最后的结果返回
		 * 
		 * @method reduceRight
		 * @param target {LikeArray} 要循环的数组
		 * @param callback {Function} 迭代器。其接受四个参数：
		 * 		value {Any} 上个方法返回的值；
		 * 		item {Any} 当前项；
		 * 		i {Number} 在数组中的位置；
		 * 		target {LikeArray} 数组对象；
		 * @param [initialValue] {Any} 初始值
		 * @return {Any} 最后一次处理函数的调用结果
		 */
		reduceRight: partialSupport ? supported('reduceRight') 
			: function(target, callback, initialValue) {
				var noInitialValue = arguments.length < 3;
				for (var i = target.length - 1; i >= 0; i--) {
					if (hasOwnProperty.call(target,i.toString())) {
						if (noInitialValue) {
							noInitiaValue = false;
							initialValue = target[i];
						} else {
							initialValue = callback(initialValue, target[i], i, target);
						}
					}
				}
				return initialValue;
			},
		
		/**
		 * 判断指定的对象是否是Array类型
		 * 
		 * @method isArray
		 * @param target {Any} 要判断的对象
		 * @return {Boolean}
		 */
		isArray: isArray,
		
		/**
		 * 判断指定的对象是否类似于数组（存在length属性，可以转化为数组）
		 * 
		 * @method likeArray
		 * @param target {Any} 要被转化的对象
		 * @return {Boolean}
		 */
		likeArray: function(target) {
			var type = typeof target;
			if (type == 'undefined' || type == 'object' && target === null) return false;
			if (typeof target.length != 'number') return false;
			return true;
		},
		
		/**
		 * 把指定的对象转化为数组格式
		 * 
		 * @method toArray
		 * @param target {Any} 要被转化的对象
		 * @return {Array}
		 */
		toArray: function(target) {
			return slice.call(target);
		}
	};
	
	return exports;
});