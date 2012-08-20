kola("kola.dom.G",[
	"kola.lang.Class",
	"kola.dom.Operation",
	"kola.dom.util.Selector",
	"kola.event.Dispatcher"
],function(KolaClass, Operation, Selector, Dispatcher){
	var exports = KolaClass(Dispatcher, {
		__ME: function(selector){
			if(KolaClass.isString(selector) && selector.charAt(0) != '<'){
				/**
				* 使用选择器选择特定dom
				* @function direct
				* @param selector {String}
				* @return {KolaElement}
				*/
				return new this(Selector(selector));
			}else{
				/**
				* 根据字符串生成dom，并生成KolaElement
				* @function direct
				* @param selector {String} 要转换的字符串，以html < 格式开头
				* @return {KolaElement}
				*/
				/**
				* 将指定的dom转换为KolaElement
				* @function direct
				* @param selector {Array<HTMLElement>|NodeList|HtmlCollection|HtmlElement|KolaElement}
				* @return {KolaElement}
				*/
				return new this(toElements(selector));
			}
		},

		/**
		* 构造函数
		* @constructor
		* @param elements {Array<HTMLElement>}
		* @return {KolaElement}
		*/
		_init: function(elements){
			this.length = elements.length;
			for(var i = 0, il = this.length; i < il; i ++)
				this[i] = elements[i];
		},

		/**
		* 依次迭代内部dom，将内部每一个元素封装成KolaElement交给callback处理
		* @method each
		* @param callback {Function} 回调函数
		* @chainable
		*/
		each: function (callback) {
			//	使用迭代器循环每个元素
			for(var i = 0, il = this.length; i < il; i++){
				callback.call(this, this.constructor(this[i]), i);
			}
			return this;
		},

		/**
            给element增加一些元素
            @param sets string,element,kolaElement
        */
        add: function(sets){
            var elements = toElements(sets);
            for(var i = 0, il = elements.length; i < il ; i ++){
                for(var j = 0, jl = this.length; j < jl; j ++){
                    if(this[j] == elements[i])
                        break;
                }
                if(j == jl){
                    this[this.length] = elements[i];
                    this._elements[this.length] = elements[i];
                    this.length++;
                }
            }
            return this;
        },

        /**
            给element排除一些元素
            @param sets element,kolaElement
        */
        remove: function(sets){
            var elements=toElements(sets);
            //Array.prototype.concat.call(this, sets);
            for(var i=0,il=elements.length;i<il;i++){
                for(var j=0,jl=this.length;j<jl;j++){
                    if(this[j]==elements[i]){
                        this.splice(j,1);
                        this._elements.splice(j,1);
                    }
                }
            }
            return this;
        },
        /*-------------------------------------- KolaElement内部函数 --------------------------------------*/
		/**
		* 依次迭代内部dom，将内部每一个元素交给callback处理
		* @method _each
		* @private
		* @param callback {Function} 回调函数
		* @chainable
		*/
		_each: function (callBack) {
			for(var i = 0, il = this.length; i < il; i ++){
				callBack.call(this,this[i]);
			}
			return this;
		},
		//使得浏览器认为实例是一个数组，方便调试
		splice:[].splice
	});
	
	//元素操作
	for(key in Operation){
		(function(functionName, item){
			if(KolaClass.isArray(item)){
				exports.prototype[functionName] = function(name, value){
					if(arguments.length == 1){//只有name的形式
						if(this[0].nodeType == 1){
							if(isChainable[0]){
								item[0].call(this, this[0], name);
								return this;
							}else{
								return item[0].call(this, this[0], name);
							}
						}
					}else{//有name，value的形式
						if(isChainable[1]){
							for(var i = 0; i < this.length; i++){
								item[1].call(this, this[i], name, value);
							}
							return this;
						}else{
							var results = [];
							for(var i = 0; i < this.length; i++){
								results.concat(item[1].call(this, this[i], name, value));
							}
						}
					}
				}
			}
		}).call(this, key, Operation[key]);
	}
	/////////////////////////////kolaDom 私有方法//////////////////////
	function isChainable(operation){
		if(operation.toString().indexOf("return ")==-1)
			return true;
		return false;
	}
	exports._private = {};
	//数组排重
	exports._private.unique = function(array){
        var flag = false;
        var le = array.length;
        for(var i = 0; i < le; i++){
            for(j = i+1; j < le; j++){
                if(array[i] === array[j]){
                    array[j] = null;
                    flag = true;
                }
            }
        }
        if (flag) {
            var top=0;
            for (var i=0; i < le; i++) {
                if(array[i]!==null)
                    array[top++]=array[i];
            }
            array.splice(top,le-top);
        }
        return array;
    }

	/**
	 * 得到元素数组
	 * @method toElements
	 * @private
	 * @param selector {Array<HTMLElement>|HTMLElement|KolaElement|String} 
	 * @return {Array<HTMLElement>}
	 */
	var toElements = exports._private.toElements = function(selector){
		if(KolaClass.isArray(selector)){
			return selector;
		}
		//	如果为html
		if(KolaClass.isString(selector)){
			
			var newDom = document.createElement('div');
			newDom.innerHTML = selector;
			var arr = [];
			for(var i = newDom.children.length-1; i >= 0; i --){
				arr[i] = newDom.children[i];
			}
			exports.fire({type: "DOMNodeInserted",data: arr});
			return arr;
		}
		// 如果是window
		if(selector == window)
			return [selector];
		//	如果为KolaElement
		if (selector instanceof exports)
			return selector;
		//	如果为HTMLElement
		if (selector.nodeType === 1) 
			return [selector];
		// 如果为document或document-fragment
		if(selector.nodeType === 9 || selector.nodeType === 11){
			if(selector.documentElement)
				selector = selector.documentElement;
			return [selector];
		}
		//	如果为HTMLCollection的话，那就返回之
		if (!KolaClass.isUndefined(selector.length)) {
			var array = [];
			for (var i = 0, il = selector.length; i < il; i ++) {
				if(selector[i].nodeType === 1)
					array.push(selector[i]);
			}
			return array;
		}
	}
	return exports;
});