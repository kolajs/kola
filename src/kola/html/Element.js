kola('kola.html.Element',[
	'kola.lang.Class',
	'kola.lang.Array',
	'kola.bom.Browser',
	'kola.html.util.Selector',
	'kola.event.Dispatcher'
],function(KolaClass, KolaArray, Browser, Selector, Dispatcher){
	//定义一个get---set的操作
	function elementAttr(get, set){
		var lengthGroup = [];
		lengthGroup[get.length - 1] = {isGet:true,fn:get};
		lengthGroup[set.length - 1] = {isGet:false,fn:set};
		return lengthGroup;
	}
	function overloadOperater(functionName, operaters){
		exports.prototype[functionName] = function(name, value){
			var operater = operaters[arguments.length];
			if(operater.isGet){
				return operater.fn.call(this, this[0], name);
			}else{
				for(var i = 0; i < this.length; i++){
					operater.fn.call(this, this[i], name, value);
				}
				return this;
			}
		}
	}
	//定义一个get0的操作
	function retriveContent(fn){
		return {
			type: "one",
			chainable: false,
			fn: fn
		}
	}
	function editContent(fn){
		return {
			type: "one",
			chainable: false,
			fn: fn
		}
	}
	function traveller(fn){
		return {
			type: "traveller",
			chainable: false,
			fn: fn
		}
	}
	function travellerOperater(functionName, operater){
		exports.prototype[functionName] = function(p0, p1){
			var results = [];
			for(var i = 0; i < this.length; i++){
				results = results.concat(operater.fn.call(this, this[i], p0, p1));
			}
			return new this.constructor(unique(results));
		}
	}
	//用于element.data的存储
	var cache = {};
	//使用随机名称，防止冲突
	var cache_attr_name = "kola" + new Date().getTime();
	//从1开始，方便检测
	var cacheSize = 1;

	var Operation = {

		// value get(name) | chain set(name, value)
		attr: elementAttr(
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
		),
		prop: elementAttr(
			/**
			 * 获取某个属性值
			 * @method attr
			 * @param targetElement {HTMLElement} 操作的element对象
			 * @param name {String} 属性名
			 * @return {String} 属性值
			 */
			function(targetElement, name){
				valueString = targetElement[name];
				
				//	如果存在有意义值的话，需要进行相应的判断
				if (typeof valueString == 'string') {
					var valueLength = valueString.length;
					
					//	修复IE下，获取A标签的host，会默认加上:80的问题
					if (name == 'host'
							&& valueLength > 3 
							&& targetElement.protocol.toLowerCase() == 'http:' 
							&& valueString.substr(valueLength - 3) == ':80') {
						
						valueString = valueString.substr(0, valueLength - 3);
					}
					
					//	修复IE下，获取A标签的pathname，没有最开始的/的问题
					if (name == 'pathname') {
						if (valueLength > 0) {
							//	如果第一个不是/，那就增加之
							if (valueString.charAt(0) != '/') {
								valueString = '/' + valueString;
							}
						} else {
							//	如果实在根目录，那就直接设置为/
							valueString = '/';
						}
					}
				}
				
				//	获取属性值
				return valueString;
			},
			/**
			 * 设置某个属性值
			 * @method attr
			 * @param targetElement {HTMLElement} 操作的element对象
			 * @param name {String} 属性名
			 * @param value {String} 属性值
			 */
			function(targetElement, name, value){
				targetElement[name] = value;
			}
		),
		data: elementAttr(
			/**
			* 得到某个元素的附加数据
			* @method data
			* @param name {String} 要设置的数据的名称
			* @return {Any} dom上name对应的数据
			*/
			function (targetElement, name) {
				index = targetElement[cache_attr_name];
				if(!index || !cache[index]) return null;
				return cache[index][name];
			},
			/**
			* 设置dom上指定的附加数据
			* @method removeData
			* @param name {String} 要删除的数据名称,如果为undefined，则表示删除全部数据
			* @param value {Any} 指定数据的名称，如果为undefined，则删除该数据
			*/
			function (targetElement, name, value) {
				if(KolaClass.isUndefined(name)){
					cache[index] = undefined;
					targetElement[cache_attr_name] = undefined;
				}else if(KolaClass.isUndefined(value)){
					cache[index][name] = undefined
				}else{
					index = targetElement[cache_attr_name];
					if(!index){
						index = cacheSize++;
						targetElement[cache_attr_name] = index;
					}
					if(!cache[index])
						cache[index] = {};
					cache[index][name] = data;
				}
			}
		),
		css: elementAttr(
			function (targetElement, name) {//这是要查询一个类名
				var className = targetElement.className;
				return className.length > 0 && (' ' + className + ' ').indexOf(' ' + name + ' ') != -1;
			},
			function (targetElement, name, value) {
				if(!value){//这是要删除一个类名
					var className = targetElement.className;
					if (className.indexOf(' ' + name + ' ') != -1) {
						targetElement.className = KolaString.trim(str.split(name).join(' ').replace(/[ ]{2,}/g,' '));
					}
				}else if(targetElement.className.indexOf(name) == -1){//这是要增加一个类名
					targetElement.className += ' ' + name;
				}
			}
		),
		style: elementAttr(
			function (targetElement, name) {
				var st = targetElement.style;
				if(name == 'opacity'){
					var filter;
					if(Browser.IEStyle){
						return st.filter.indexOf("opacity=") >= 0 ? parseFloat(st.filter.match(/opacity=([^)]*)/)[1]) / 100 : 1;
					}else{
						return (filter = st.opacity) ? parseFloat(filter) : 1;
					}
				}else{
					return getComputedStyle(element, name);
				}
			},
			function (targetElement, name, value) {
				var st = targetElement.style;
				if(name == 'opacity'){
					if(Browser.IEStyle){
						st.filter = 'Alpha(Opacity=' + value*100 + ')'; 
					}else{
						st.opacity = (value == 1 ? '' : '' + value);
					}
				}else{
					//如果是数字，自动加px
					var newValue = parseFloat(value);
					if(newValue == value && !noPx[name])
						value = value + "px";
					st[name] = value;
				}
			}
		),
		val: elementAttr(
			function (targetElement) {
				return targetElement.value;
			},
			function (targetElement, value) {
				targetElement.value = value;
			}
		),
		html: elementAttr(
			function (targetElement) {
				return targetElement.innerHTML;
			},
			function (targetElement, value) {
				if (Browser.IEStyle) {
					//	ie下直接调用替代方法
					innerHtml(targetElement, value);
				} else {
					//	首先调用原生方法，如果出错的话，那就调用替代方法
					try {
						this.innerHTML = value;
					} catch(e) {
						innerHtml(targetElement, value);
					}
				}
	            exports.fire({type: 'DOMNodeInserted', data: targetElement.childNodes});
			}
		),
		outer: elementAttr(
			function (targetElement) {
				return targetElement.outerHTML;
			},
			function (targetElement, value) {
				Operation.before(targetElement, value);
                Operation.remove(targetElement);
			}
		),
		text: elementAttr(
			function (targetElement) {
				return typeof(targetElement.innerText) != 'undefined' ? targetElement.innerText : targetElement.textContent;
			},
			function (targetElement, value) {
				targetElement.value = value;
			}
		),
		////////////////////////////////////////////////////////////////////
		/**
			得到父元素
		*/
		parent: traveller(function (element) {
			return element.parentNode;
		}),
		/**
			得到符合条件的祖先元素
		*/
		parents: traveller(function (element, selector) {
			var nodes = [];
			while ((element = element.parentNode) && (element.nodeType == 1)) {
				nodes.push(element);
			}
			return Selector(selector,nodes);
		}),
		/**
			元素及其祖先元素中最靠近当前元素的符合条件的元素
		*/
		closest: traveller(function (element, selector) {
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
		}),
		/**
			得到符合selector的子元素
		*/
		children: traveller(function (element, selector) {
			var c = [];
			for(var i = 0; i < element.children.length; i ++)
				c[i] = element.children[i];
			return Selector.filter(selector, c);
		}),
		find: traveller(function (element, selector) {
			var arrs = Selector(selector, element);
			if(Selector.matchesSelector(element, selector))
				arrs.push(element);
			return arrs;
		}),
		descendants: traveller(function (element, selector) {
			return Selector(selector, element);
		}),
		/**
		 * 拿到每一个元素的前一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		prev: traveller(function (element, selector){
			while(element = element.previousSibling){
				if (element.nodeType == 1) {
					if(!selector || Selector.matchesSelector(element, selector))
						return element;
				}
			}
		}),
		/**
		 * 拿到每一个元素的后一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		next: traveller(function (element, selector){
			while(element = element.nextSibling){
				if (element.nodeType == 1){
					if(!selector || Selector.matchesSelector(element, selector))
						return element;
				}
			}
		})
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
		/**
		 * 隐藏元素
		 * method hide
		 * @chainable
		 */
		hide:function(){
			return this.addClass("___Kola___Hidden");
		},
		
		/**
		 * 显示元素
		 * method show
		 * @chainable
		 */
		show:function(){
			return this.removeClass("___Kola___Hidden");
		}
		//使得浏览器认为实例是一个数组，方便调试
		splice:[].splice
	});

	//元素操作
	for(key in Operation){
		var item = Operation[key];
		if(KolaClass.isArray(item)){ //item 是数组，为重载函数
			overloadOperater.call(this, key, item);
		}else{
			if(item.type == "traveller")
			travellerOperater.call(this, key, item);
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
	/*
	 * 获取样式属性
	 * @param element {HTMLElement}
	 * @param name {String}
	 * @return {Stirng}
	 */
	var getComputedStyle = function(element, name) {
		if (window.getComputedStyle) {
			return window.getComputedStyle(element, null).getPropertyValue(hyphenate(name));
		}
		if (document.defaultView && document.defaultView.getComputedStyle) {
			var computedStyle = document.defaultView.getComputedStyle(element, null);
			if (computedStyle) return computedStyle.getPropertyValue(hyphenate(name));
			if (name == "display") return "none";
		}
		if (element.currentStyle) {
			return element.currentStyle[name];
		}
		return element.style[name];
	}
	//不需要增加px的属性名称集合
	var noPx={
		"zIndex": true,
		"fontWeight": true,
		"opacity": true,
		"zoom": true,
		"lineHeight": true
	};
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
		/**
	 * 设置对象的innerHTML，主要针对不直接支持innerHTML的对象
	 * @param el
	 * @param value
	 */
	var innerHtml = function(el, value) {
		//	先解除旗下所有节点的事件，避免内存泄露
		purgeChildren( el );
		
		//	这里主要对table,select进行特殊处理，还有其他元素待处理
		var translations = {
				table: 	[1, '<table>', '</table>'],
				select: [1, '<select>', '</select>'],
				tbody: 	[2, '<table><tbody>', '</tbody></table>'],
				tr: 	[3, '<table><tbody><tr>', '</tr></tbody></table>']
			},
			tagName = el.tagName.toLowerCase(),
			wrap = translations[ tagName ];

		if ( wrap ) {
			var node,
				wrapper = document.createElement('div');

			//	使用dom方法，删除所有子节点
			while (el.firstChild) {
				el.removeChild(el.firstChild);
			}

			//	设置替代内容，并获取新添加的节点
			wrapper.innerHTML = wrap[1] + value + wrap[2];
			for (var i = wrap[0]; i--;) {
				wrapper = wrapper.firstChild;
			}
			while ( node = wrapper.firstChild ) {
				appendChild( el, node );
			}

			//	如果是ie9以前的版本，并且设置的是select，那就默认聚焦到第一个。这主要是解决ie9之前的版本都是默认设置到最后一个，而别的浏览器级版本都是聚焦到第一个
			if ( tagName == 'select' && Browser.IEStyle ) {
				el.selectedIndex = 0;
			}
		} else {
			el.innerHTML = value;
		}

		return el.childNodes;
	};
	return exports;
});