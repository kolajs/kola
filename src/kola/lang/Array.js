/**
 * @fileOverview kola.lang.Array 数组类
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.lang.Array', 
	null, 
	function() {

	/********************************************** 类定义 **********************************************/
	
	var Array = {
		
		/**
		 * 在数组中搜索指定元素的位置，可以设置起始位置
		 * @param {Array} array 被搜索的数组
		 * @param {String} searchElement 要搜索的元素
		 * @param {Number} fromIndex 开始位置。如果不是数字的话，则表示从0开始；如果是负数，那就表示从倒数第几个开始。
		 * @return 搜索到的位置，如果没有则返回-1
		 * @type Number
		 */
		indexOf: function(array, searchElement, fromIndex) {
			//	如果存在原生的方法，那就直接调用之
			if (array.indexOf) return array.indexOf(searchElement, fromIndex);
			
			//	如果数组长度为0，那就返回-1
			var length = array.length;
			if (length == 0) return -1;
			
			//	拿到起始位置
			var start = typeof(fromIndex) == 'number' ? fromIndex : 0,
				absStart = start >= 0 ? start : Math.max(length + start, 0);
			
			//	如果起始位置大于数组长度，那就返回-1
			if (absStart >= length) return -1;
			
			//	从起始位置开始，寻找元素
			for (var i = absStart, il = array.length; i < il; i ++) {
				if (array[i] === searchElement) return i;
			}
			return -1;
		},
        /**
            数组排除重复元素
        */
		unique:function(array){
            var flag=false;
            var le=array.length;
            for(var i=0;i<le;i++){
                for(j=i+1;j<le;j++){
                    if(array[i]===array[j]){
                        array[j]=null;
                        flag=true;
                    }
                }
            }
            if(flag){
                var top=0;
                for(var i=0;le;i++){
                    if(array[i]!==null)
                        array[top++]=array[i];
                }
                array.splice(top,le-top);
            }
            return array;
        },
		/**
		 * 在数组中从后往前搜索指定元素的位置，可以设置起始位置
		 * @param {Array} array 被搜索的数组
		 * @param {String} searchElement 要搜索的元素
		 * @param {Number} fromIndex 开始位置。如果不是数字的话，则表示从0开始；如果是负数，那就表示从倒数第几个开始。
		 * @return 搜索到的位置，如果没有则返回-1
		 * @type Number
		 */
		lastIndexOf: function(array, searchElement, fromIndex) {
			//	如果存在原生的方法，那就直接调用之
			if (array.lastIndexOf) return array.lastIndexOf(searchElement, fromIndex);
			
			//	如果数组长度为0，那就返回-1
			var length = array.length;
			if (length == 0) return -1;
			
			//	拿到起始位置
			var start = typeof(fromIndex) == 'number' ? fromIndex : length - 1,
				absStart = start >= 0 ? start : Math.max(length + start, 0);
			
			//	如果起始位置大于数组长度，那就返回-1
			if (absStart >= length) return -1;
			
			//	从起始位置开始，寻找元素
			for (var i = absStart; i >= 0; i --) {
				if (array[i] === searchElement) return i;
			}
			return -1;
		},
        /**
            删除数组中的某个元素
        */
		remove:function(arr,item){
            var i=A.indexOf(arr,item);
            if(i!=-1)
                arr.splice(i,1);
        },
		/**
		 * 循环数组中的每一项，依次交给迭代器，确认所有的返回值都是true，才会返回true，其他情况返回false
		 * @param {Array} array 要循环的数组
		 * @param {Function} callbackfn 迭代器
		 * @param {ANY} thisArg 给迭代器设置的上下文。如果不存在的话，那就是undefined
		 * @return 返回值
		 * @type Boolean
		 */
		every: function(array, callbackfn, thisArg) {
			return each(array, 'every', function(item, i, array) {
				if (callbackfn.call(thisArg, item, i, array) == false) return $break;
			});
		},
		
		/**
		 * 循环数组中的每一项，依次交给迭代器，如果存在返回值为true，那就返回true，其他情况返回false
		 * @param {Array} array 要循环的数组
		 * @param {Function} callbackfn 迭代器
		 * @param {ANY} thisArg 给迭代器设置的上下文。如果不存在的话，那就是undefined
		 * @return 返回值
		 * @type Boolean
		 */
		some: function(array, callbackfn, thisArg) {
			return !each(array, 'some', function(item, i, array) {
				if (callbackfn.call(thisArg, item, i, array) == true) return $break;
			});
		},
		
		/**
		 * 在数组中从后往前搜索指定元素的位置，可以设置起始位置
		 * @param {Array} array 要循环的数组
		 * @param {Function} callbackfn 迭代器
		 * @param {ANY} thisArg 给迭代器设置的上下文。如果不存在的话，那就是undefined
		 */
		forEach: function(array, callbackfn, thisArg) {
			each(array, 'forEach', function(item, i, array) {
				callbackfn.call(thisArg, item, i, array);
			});
		},
		
		/**
		 * 循环数组中的每一项，依次交给迭代器，得到的每个返回值，依次装入得到一个新数组
		 * @param {Array} array 要循环的数组
		 * @param {Function} callbackfn 迭代器
		 * @param {ANY} thisArg 给迭代器设置的上下文。如果不存在的话，那就是undefined
		 * @return 返回值
		 * @type Boolean
		 */
		map: function(array, callbackfn, thisArg) {
			var values = ArrayOrg(array.length);
			each(array, 'some', function(item, i, array) {
				values[i] = callbackfn.call(thisArg, item, i, array);
			});
			return values;
		},
		
		/**
		 * 循环数组中的每一项，依次交给迭代器，如果返回值为true，那就将该项存储到一个新数组中
		 * @param {Array} array 要循环的数组
		 * @param {Function} callbackfn 迭代器
		 * @param {ANY} thisArg 给迭代器设置的上下文。如果不存在的话，那就是undefined
		 * @return 返回值
		 * @type Boolean
		 */
		filter: function(array, callbackfn, thisArg) {
			var values = [];
			each(array, 'filter', function(item, i, array) {
				if(callbackfn.call(thisArg, item, i, array) == true) {
					values.push(item);
				}
			});
			return values;
		}
		
	};
	
	/********************************************** 私有变量 **********************************************/
	
	var ArrayOrg = [].constructor,			//	存储原生的Array方法
		$break = {};
	
	/********************************************** 私有方法 **********************************************/
		
	/**
	 * 循环数组中的每一项，依次交给迭代器。如果迭代没有被中断，那就返回true，否则返回false
	 * @param {Array} array 要循环的数组
	 * @param {Function} fn 要对数组调用的方法的名称
	 * @param {Function} callbackfn 迭代器
	 * @return 返回值
	 * @type Boolean
	 */
	var each = function(array, fn, callbackfn) {
		//	如果存在原生的方法，那就直接调用之
		if (array[fn]) return array[fn](callbackfn);
		
		//	循环数组中的每个项，依次传给迭代器
		for (var i = 0, il = array.length; i < il; i ++) {
			if (array.hasOwnProperty(i.toString())) {
				if (callbackfn(array[i], i, array) == $break) return false;
			}
		}
		return true;
	};
	
	/********************************************** 返回类 **********************************************/
	
	return Array;
	
});