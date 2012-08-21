kola('kola.html.Element',[
	'kola.lang.Class',
	'kola.lang.Array',
	'kola.bom.Browser',
	'kola.html.util.Selector',
	'kola.event.Dispatcher'
],function(KolaClass, KolaArray, Browser, Selector, Dispatcher){
	var Operation = {
		// value get(name) | chain set(name, value)
		attr: [
			/**
			 * 获取某个属性值
			 * @method attr
			 * @param targetElement {HTMLElement} 操作的element对象
			 * @param name {String} 属性名
			 * @return {String} 属性值
			 */
			function(targetElement, name){
				switch(name){
					case 'class':
						return targetElement.className;
					case 'style':
						return targetElement.style.cssText;
					default:
						return attr(targetElement, name);
				}
			},
			/**
			 * 设置某个属性值
			 * @method attr
			 * @param targetElement {HTMLElement} 操作的element对象
			 * @param name {String} 属性名
			 * @param value {String} 属性值
			 * @chainable
			 */
			function(targetElement, name, value){
				switch(name){
					case 'class':
						targetElement.className = value;
						break;
					case 'style':
						targetElement.style.cssText = value;
						break;
					default:
						//	如果是设置一个事件，而且是ie下的话，需要采用.on...的形式，setAttribute的形式是有问题的
						if (Browser.IEStyle && name.indexOf('on') == 0) {
							//	如果是字符串，需要转换成一个方法，ie下只能接受方法
							if (typeof(value) == 'string') {
								value = new Function(value);
							}
							targetElement[name] = value;
						} else {
							targetElement.setAttribute(name, value);
						}
				}
			}
		],
		/**
            得到父元素
        */
        parent: function (element) {
            return element.parentNode;
        },
        /**
            得到符合条件的祖先元素
        */
        parents: function (element, selector) {
            var nodes = [];
            while ((element = element.parentNode) && (element.nodeType == 1)) {
                nodes.push(element);
            }
            return Selector(selector,nodes);
        },
        /**
            元素及其祖先元素中最靠近当前元素的符合条件的元素
        */
        closest: function (element, selector) {
            //如果是选择器，则找到符合选择器的元素
            if(O.isString(selector)){
                while (element.nodeType == 1) {
                    if(Selector.matchesSelector(element, selector))
                        return element;
                    element = element.parentNode
                }
            }else{//如果是数组，则从数组中找
                while (element.nodeType == 1) {
                    if(KolaArray.indexOf(selector, element) != -1)
                        return element;
                    element = element.parentNode
                }
            }
        },
        /**
            得到符合selector的子元素
        */
        children: function (element, selector) {
            var c = [];
            for(var i = 0; i < element.children.length; i ++)
                c[i] = element.children[i];
            return Selector.filter(selector, c);
        },
		find: function (element, selector) {
            var arrs = Selector(selector, element);
            if(Selector.matchesSelector(element, selector))
            	arrs.push(element);
            return arrs;
        },
        descendants: function (element, selector) {
            return Selector(selector, element);
        },
        /**
		 * 拿到每一个元素的前一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
        prev: function (element, selector){
            while(element = element.previousSibling){
                if (element.nodeType == 1) {
                    if(!selector || Selector.matchesSelector(element, selector))
                        return element;
                }
            }
        },
        /**
		 * 拿到每一个元素的后一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
        next: function (element, selector){
            while(element = element.nextSibling){
                if (element.nodeType == 1){
                    if(!selector || Selector.matchesSelector(element, selector))
                        return element;
                }
            }
        }
	}
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
		var item = Operation[key];
		if(KolaClass.isArray(item)){ //item 是数组，为重载函数
			item[0].isChainable = isChainable(item[0]);
			item[1].isChainable = isChainable(item[1]);
			addOverloadOperater.call(this, key, item[0], item[1]);
		}else{
			item.isChainable = isChainable(item);
			addEachOperater.call(this, key, item);
		}
	}
	
	function isChainable(operation){
		if(operation.toString().indexOf('return ') == -1)
			return true;
		return false;
	}
	
    function addEachOperater(functionName, operater){
    	exports.prototype[functionName] = function(p0, p1){
    		if(operater.isChainable){
				for(var i = 0; i < this.length; i++){
					operater.call(this, this[i], p0, p1);
				}
				return this;
			}else{
				var results = [];
				for(var i = 0; i < this.length; i++){
					results = results.concat(operater.call(this, this[i], p0, p1));
				}
				return new this.constructor(unique(results));
			}
    	}
    }
    function addOverloadOperater(functionName, getOperater, setOperater){
		exports.prototype[functionName] = function(name, value){
			if(arguments.length == 1){//只有name的形式
				if(this[0].nodeType == 1){
					if(getOperater.isChainable){
						getOperater.call(this, this[0], name);
						return this;
					}else{
						return getOperater.call(this, this[0], name);
					}
				}
			}else{//有name，value的形式
				if(setOperater.isChainable){
					for(var i = 0; i < this.length; i++){
						setOperater.call(this, this[i], name, value);
					}
					return this;
				}else{
					var results = [];
					for(var i = 0; i < this.length; i++){
						results = results.concat(setOperater.call(this, this[i], name, value));
					}
					return new this.constructor(unique(results));
				}
			}
		}
	}
	//数组排重
	var unique = function(array){
        var flag = false;
        var le = array.length;
        for(var i = 0; i < le; i++){
            for(j = i + 1; j < le; j++){
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
	var toElements = function(selector){
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
			exports.fire({type: 'DOMNodeInserted',data: arr});
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
	/**
	 * 获取一个对象的某个attribute，主要是为了解决IE下在form节点上获取attribute不对的问题
	 */
	var attr = function (element, name) {
	
		var value = element.getAttribute(name);
		
		//todo:对表单元素属性的封装
		if(value == null){
			value = element[name];
		}
		if (document.all && typeof(value) == 'object' && value != null) {
			value = element.attributes.getNamedItem(name);
			return !!value ? value.value : null;
		}
		return value;
	};
	return exports;
});