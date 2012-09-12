/**
 * 增强JS基本数据类型的功能
 * 
 * @module kola.lang
 */

kola('kola.lang.Array', null, function() {
	
	/**
	 * kola的Array类
	 * 
	 * @class Array
	 * @static
	 * 
	 * @author Jady Yang
	 */
	var userAgent = navigator.userAgent;
	if (userAgent.indexOf('MSIE') != -1 
		&& parseInt(userAgent.substr(userAgent.indexOf('MSIE') + 5, 3 )) < 9
	) {
		
		var exports = {
			
			/**
			 * 获取指定元素在数组中的位置
			 * 
			 * @method indexOf
			 * @param target {Array} 被搜索的数组
			 * @param searchElement {Any} 要搜索的元素
			 * @param [fromIndex] {Number} 开始位置。如果不是数字的话，则表示从0开始；如果是负数，那就表示从倒数第几个开始。
			 * @return {Number} 搜索到的位置，如果没有则返回-1
			 */
			indexOf: function(target, searchElement, fromIndex) {	
				//	如果数组长度为0，那就返回-1
				var length = target.length;
				
				//	拿到起始位置
				var start = typeof(fromIndex) == 'number' ? fromIndex : 0,
					absStart = start >= 0 ? start : Math.max(length + start, 0);
							
				//	从起始位置开始，寻找元素
				for (var i = absStart, il = target.length; i < il; i ++) {
					if (target[i] === searchElement) return i;
				}
				
				return -1;
			},
			
			/**
			 * 在数组中从后往前搜索指定元素的位置
			 * 
			 * @method lastIndexOf
			 * @param target {Array} 被搜索的数组
			 * @param searchElement {Any} 要搜索的元素
			 * @param [fromIndex] {Number} 开始位置。如果不是数字的话，则表示从0开始；如果是负数，那就表示从倒数第几个开始。
			 * @return {Number} 搜索到的位置，如果没有则返回-1
			 */
			lastIndexOf: function(target, searchElement, fromIndex) {
				//	如果数组长度为0，那就返回-1
				var length = target.length;
				if (arguments.length == 2) {
					fromIndex = length -1;
				}
				
				//	拿到起始位置
				var start = typeof(fromIndex) == 'number' ? fromIndex : 0,
					absStart = start >= 0 ? start : Math.max(length + start, 0);
				
				//	从起始位置开始，寻找元素
				for (var i = absStart; i >= 0; i --) {
					if (target[i] === searchElement) return i;
				}
				return -1;
			},
			
			/**
			 * 循环数组中的每一项，依次交给迭代器，确认所有的返回值都是true，才会返回true，其他情况返回false
			 * 
			 * @method every
			 * @param target {Array} 要循环的数组
			 * @param callback {callback | Function} 迭代器
			 * @param [scope] {Any} 给迭代器设置的上下文。如果不存在的话，那就是undefined
			 * @return {Boolean} 返回值
			 */
			every: function(target, callback, scope) {
				return each(target, 'every', function(item, i, target) {
					return callback.call(scope, item, i, target)
				});
			},
			
			/**
			 * 循环数组中的每一项，依次交给迭代器，如果存在返回值为true，那就返回true，其他情况返回false
			 * 
			 * @method some
			 * @param target {Array} 要循环的数组
			 * @param callback {callback | Function} 迭代器
			 * @param scope {Any} 给迭代器设置的上下文。如果不存在的话，那就是undefined
			 * @return {Boolean} 返回值
			 */
			some: function(target, callback, scope) {
				return !each(target, 'some', function(item, i, target) {
					return !callback.call(scope, item, i, target);
				});
			},
			
			/**
			 * 在数组中从后往前搜索指定元素的位置，可以设置起始位置
			 * 
			 * @method forEach
			 * @param target {Array} 要循环的数组
			 * @param callback {callback | Function} 迭代器
			 * @param scope {Any} 给迭代器设置的上下文。如果不存在的话，那就是undefined
			 */
			forEach: function(target, callback, scope) {
				each(target, 'forEach', function(item, i, target) {
					callback.call(scope, item, i, target);
				});
			},
			
			/**
			 * 循环数组中的每一项，依次交给迭代器，得到的每个返回值，依次装入得到一个新数组
			 * 
			 * @method map
			 * @param target {Array} 要循环的数组
			 * @param callback {callback | Function} 迭代器
			 * @param scope {Any} 给迭代器设置的上下文。如果不存在的话，那就是undefined
			 * @return {Array} 包含每次迭代结果的新数组
			 */
			map: function(target, callback, scope) {
				var values = [];
				each(target, 'some', function(item, i, target) {
					values.push(callback.call(scope, item, i, target));
				});
				return values;
			},
			
			/**
			 * 循环数组中的每一项，依次交给迭代器，如果返回值为true，那就将该项存储到一个新数组中
			 * 
			 * @method filter
			 * @param target {Array} 要循环的数组
			 * @param callback {callback | Function} 迭代器
			 * @param scope {Any} 给迭代器设置的上下文。如果不存在的话，那就是undefined
			 * @return {Array} 过滤后的新数组
			 */
			filter: function(target, callback, scope) {
				var values = [];
				each(target, 'filter', function(item, i, target) {
					if (callback.call(scope, item, i, target) == true) {
						values.push(item);
					}
				});
				return values;
			},
			
			/**
			 * 从前向后循环数组中的每一项调用处理函数，前一项的结果交给后一项指导处理完成，将最后的结果返回
			 * 
			 * @method reduce
			 * @param target {Array} 要循环的数组
			 * @param callback {Function} 迭代器
			 * @param [initialValue] {Any} 初始值
			 * @param scope {Any} 给迭代器设置的上下文。如果不存在的话，那就是undefined
			 * @return {Any} 最后一次处理函数的调用结果
			 */
			/*
			 * reduce的回调函数
			 * 
			 * @callback 
			 * @param previous {Any} 之前的处结果，如果是第一次调用，则为initialValue
			 * @param current {Any} 当item前的值
			 * @param index {Any} 当前的index
			 * @param target {Any} 被处理的数组
			 * @return {Any} 当前item的处理结果
			 */
			reduce: function(target, callback, initialValue, scope) {
				initialValue = initialValue || 0;
				each(target, 'reduce', function(item, i, target){
					initialValue = callback.call(scope, initialValue, item, i, target);
				});
				return initialValue;
			}
		};
		/********************************************** 私有方法 **********************************************/
		
		/**
		 * 循环数组中的每一项，依次交给迭代器。如果迭代没有被中断，那就返回true，否则返回false
		 * 
		 * @method each
		 * @private
		 * @param target {Array} 要循环的数组
		 * @param fn {Function} 要对数组调用的方法的名称
		 * @param callback {Function} 迭代器
		 * @return {Boolean} 返回值
		 */
		var each = function(target, fn, callback) {		
			//	循环数组中的每个项，依次传给迭代器
			for (var i = 0, il = target.length; i < il; i ++) {
				if (target.hasOwnProperty(i.toString())) {
					if (callback(target[i], i, target) == false) return false;
				}
			}
			return true;
		};
	}else{
		var exports = {
			indexOf: function(target, searchElement, fromIndex) {
				return target.indexOf(searchElement, fromIndex);
			},
			lastIndexOf: function(target, searchElement, fromIndex) {
				if (arguments.length == 3)
					return target.lastIndexOf(searchElement, fromIndex);
				else
					return target.lastIndexOf(searchElement);
			}
		};
		['every', 'some', 'forEach', 'map', 'filter'].forEach(function(item){
			exports[item] = function(target, callback, scope){
				if (!scope){
					return target[item](callback);
				}else{
					return target[item](function(item, i, target){
						return callback.call(scope, item, i, target)
					});
				}
			}
		});
		exports.reduce = function(target, callback, initialValue, scope) {
			initialValue = initialValue || 0;
			return target.reduce(function(prev, item, i, target){
				return callback.call(scope, prev, item, i, target)
			}, initialValue);
		}
	}
	/**
	 * 从一个拥有length属性的object生成一个数组
	 * @method parse
	 * @param source {Object} 类数组
	 * @return {Array}
	 */
	exports.parse = function(source) {
		var sourceLength = source.length
		var result = [];
		if (!sourceLength)
			return []
		for(var i = 0; i < sourceLength; i++){
			result.push(source[i]);
		}
		return source;
	};
	
	return exports;
});