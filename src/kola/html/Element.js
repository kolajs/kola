/**
 * kola html Element 包，提供dom元素的封装33
 * 
 * @module kola.html.Element
 */

kola('kola.html.Element',[
	'kola.lang.Class',
	'kola.lang.Array',
	'kola.bom.Browser',
	'kola.html.util.Selector',
	'kola.event.Dispatcher'
],function(KolaClass, KolaArray, Browser, Selector, Dispatcher){
	//用于element.data的存储
	var cache = {};
	//使用随机名称，防止冲突
	var cache_attr_name = "kola" + new Date().getTime();
	//从1开始，方便检测
	var cacheSize = 1;
	/**
	 * kola的KolaElement类
	 * 
	 * @class KolaElement
	 * 
	 */
	var Operation = {
		attr: elementAttr(
			/**
			 * 获取某个属性值
			 * @method attr
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
						//ie href,src,width,height
						var value = targetElement.getAttribute(name, 2);
						//todo:对表单元素属性的封装
						if(value == null){
							value = targetElement[name];
						}
						if (Browser.IEStyle){
							if(typeof(value) == 'object' && value != null) {
								value = targetElement.attributes.getNamedItem(name);
								return !!value ? value.value : null;
							}else{
								if(KolaClass.isUndefined(value))
									return

								return value.toString();
							}
						}
						return value;
				}
			},
			/**
			 * 设置某个属性值
			 * @method attr
			 * @param name {String} 属性名
			 * @param value {String} 属性值
			 * @chainable
			 */
			function(targetElement, name, value){
				if(value == undefined){
					targetElement.removeAttribute(name);
					return
				}
				switch(name){
					case 'class':
						targetElement.className.toLowerCase() = value;
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
							targetElement.setAttribute(name, "" + value);
						}
				}
			}
		),
		prop: elementAttr(
			/**
			 * 获取某个原生属性值
			 * @method prop
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
			 * 设置某个原生属性值
			 * @method prop
			 * @param name {String} 属性名
			 * @param value {String} 属性值
			 * @chainable
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
				if(!index || !cache[index]) return undefined;
				return cache[index][name];
			},
			/**
			* 设置dom上指定的附加数据
			* @method removeData
			* @param name {String} 要删除的数据名称,如果为undefined，则表示删除全部数据
			* @param value {Any} 指定数据的名称，如果为undefined，则删除该数据
			* @chainable
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
			/**
			* 查询一个元素的类名
			* @method css
			* @param name {String} 要设置的类名的名称
			* @return {Boolean} 该类名是否存在
			*/
			function (targetElement, name) {//这是要查询一个类名
				var className = targetElement.className;
				return className.length > 0 && (' ' + className + ' ').indexOf(' ' + name + ' ') != -1;
			},
			/**
			* 设置一个元素的类名
			* @method css
			* @param name {String} 要设置的类名的名称
			* @param value {Boolean} 对类名的操作：true:增加类名 false:移除类名
			* @chainable
			*/
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
			/**
			* 查询一个元素的样式
			* @method style
			* @param name {String} 要设置的样式的名称
			* @return {String|Number} 样式的值
			*/
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
			/**
			* 设置一个元素的样式
			* @method style
			* @param name {String|Undefined} 要设置的类名的名称
			* @param value {Boolean} 对类名的操作：true:增加类名 false:移除类名
			* @chainable
			*/
			function (targetElement, name, value) {
				var elementStyle = targetElement.style;
				if(value == undefined){//要删除一个样式
					if (elementStyle.removeProperty){
						elementStyle.removeProperty(name);
					}else if(elementStyle.removeAttribute){
						if(name == 'opacity' && typeof(targetElement.style.filter) == 'string'){
							name = 'filter';
						}
						elementStyle.removeAttribute(name);
					}else{
						elementStyle[name] = null;
					}
					return;
				}//要修改一个样式
				if(name == 'opacity'){
					if(Browser.IEStyle){
						elementStyle.filter = 'Alpha(Opacity=' + value*100 + ')'; 
					}else{
						elementStyle.opacity = (value == 1 ? '' : '' + value);
					}
				}else{
					//如果是数字，自动加px
					var newValue = parseFloat(value);
					if(newValue == value && !noPx[name])
						value = value + "px";
					elementStyle[name] = value;
				}
			}
		),
		val: elementAttr(
			/**
			* 查询一个表单的值
			* @method val
			* @return {String} 样式的值
			*/
			function (targetElement) {
				return targetElement.value;
			},
			/**
			* 设置一个表单的值
			* @method val
			* @param value {String} 样式的值
			* @chainable
			*/
			function (targetElement, value) {
				targetElement.value = value;
			}
		),
		html: elementAttr(
			/**
			* 查询一个元素的内部html
			* @method html
			* @return {String} 内部的html
			*/
			function (targetElement) {
				return targetElement.innerHTML;
			},
			/**
			* 设置一个元素的内部html
			* @method html
			* @param value {String} 内部的html
			* @chainable
			*/
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
		outerHtml: elementAttr(
			/**
			* 查询一个元素的html(包含元素自身)
			* @method outerHtml
			* @return {String}
			*/
			function (targetElement) {
				return targetElement.outerHTML;
			},
			/**
			* 设置一个元素的html(包含元素自身)
			* @method outerHtml
			* @param value {String} 要设置的html
			* @chainable
			*/
			function (targetElement, value) {
				Operation.before(targetElement, value);
                Operation.remove(targetElement);
			}
		),
		text: elementAttr(
			/**
			* 查询一个元素的内部文本
			* @method text
			* @return {String}
			*/
			function (targetElement) {
				return typeof(targetElement.innerText) != 'undefined' ? targetElement.innerText : targetElement.textContent;
			},
			/**
			* 设置一个元素的内部文本
			* @method text
			* @param value {String} 内部的文本
			* @chainable
			*/
			function (targetElement, value) {
				typeof(targetElement.innerText) != 'undefined' ? 
					targetElement.innerText = value :
					targetElement.textContent = value;
			}
		),
		////////////////////////////////////////////////////////////////////
		/**
		 * 得到父元素
		 * @method parent
		 * @return {KolaElement} 新的元素集合
		 */
		parent: traveller(function (targetElement) {
			return targetElement.parentNode;
		}),
		/**
		 * 得到祖先元素
		 * @method parents
		 * @param [selector] {String} 过滤器，用于过滤得到的结果
		 * @return {KolaElement} 新的元素集合
		 */
		parents: traveller(function (targetElement, selector) {
			var nodes = [];
			while ((targetElement = targetElement.parentNode) && (targetElement.nodeType == 1)) {
				nodes.push(targetElement);
			}
			if(selector)
				return Selector(selector, nodes);
			return nodes;
		}),
		/**
		 * 从当前元素开始向文档根部查找，得到第一个符合条件的元素
		 * @method closest
		 * @param selector {String|Array[]} 用于指定查找的条件
		 * @return {KolaElement} 新的元素集合
		 */
		closest: traveller(function (targetElement, selector) {
			//如果是选择器，则找到符合选择器的元素
			if(KolaClass.isString(selector)){
				while (targetElement.nodeType == 1) {
					if(Selector.matchesSelector(targetElement, selector))
						return targetElement;
					targetElement = targetElement.parentNode
				}
			}else{//如果是数组，则从数组中找
				while (targetElement.nodeType == 1) {
					if(KolaArray.indexOf(selector, targetElement) != -1)
						return targetElement;
					targetElement = targetElement.parentNode
				}
			}
		}),
		/**
		 * 得到下一级元素
		 * @method children
		 * @param [selector] {String} 过滤器，用于过滤得到的结果
		 * @return {KolaElement} 新的元素集合
		 */
		children: traveller(function (targetElement, selector) {
			return Selector.match(selector, Array.prototype.slice.call(targetElement.children));
		}),
		/**
		 * 得到元素以及元素内部符合条件的元素集合
		 * @method find
		 * @param selector {String} 选择器，用于指定要查找的元素类型
		 * @return {KolaElement} 新的元素集合
		 */
		find: traveller(function (targetElement, selector) {
			var arrs = Selector(selector, targetElement);
			if(Selector.matchesSelector(targetElement, selector))
				arrs.push(targetElement);
			return arrs;
		}),
		/**
		 * 得到元素内部符合条件的元素集合
		 * @method children
		 * @param selector {String} 选择器，用于指定要查找的元素类型
		 * @return {KolaElement} 新的元素集合
		 */
		descendants: traveller(function (targetElement, selector) {
			return Selector(selector, targetElement);
		}),
		/**
		 * 得到前一个符合条件的节点
		 * @method prev
		 * @param [selector] {String} 选择器，如果提供，则得到元素前第一个符合条件的节点
		 * @return {KolaElement} 新的元素集合
		 */
		prev: traveller(function (targetElement, selector){
			while(targetElement = targetElement.previousSibling){
				if (targetElement.nodeType == 1) {
					if(!selector || Selector.matchesSelector(targetElement, selector))
						return targetElement;
				}
			}
		}),
		/**
		 * 得到后一个符合条件的节点
		 * @method next
		 * @param [selector] {String} 选择器，如果提供，则得到元素后第一个符合条件的节点
		 * @return {KolaElement} 新的元素集合
		 */
		next: traveller(function (targetElement, selector){
			while(targetElement = targetElement.nextSibling){
				if (targetElement.nodeType == 1){
					if(!selector || Selector.matchesSelector(targetElement, selector))
						return targetElement;
				}
			}
		}),
		///////////////////////////////////////////////////////////////////////
		/**
		* 在元素内部尾部增加一些dom
		* @method append
		* @param elements {DomRefer} 要增加的dom
		* @chainable
		*/
		append: content(function(targetElement, elements){
            for(var i = 0, il = elements.length; i < il; i++){
                appendChild(targetElement, elements[i]);
            }
		}),
		/**
		* 在元素内部头部增加一些dom
		* @method prepend
		* @param elements {DomRefer} 要增加的dom
		* @chainable
		*/
		prepend: content(function(targetElement, elements){
			var offset = targetElement.firstChild || null;
            for(var i = 0, il = elements.length; i < il; i++){
                insertBefore(targetElement, elements[i], offset);
            }
		}),
		/**
		* 在元素外部前面增加一些dom
		* @method before
		* @param elements {DomRefer} 要增加的dom
		* @chainable
		*/
		before: content(function(targetElement, elements){
			var parent = targetElement.parentNode;
            for(var i = 0, il = elements.length; i < il; i++){
                insertBefore(parent, elements[i], targetElement);
            }
		}),
		/**
		* 在元素外部后面增加一些dom
		* @method after
		* @param elements {DomRefer} 要增加的dom
		* @chainable
		*/
		after: content(function(targetElement, elements){
			var parent = element.parentNode;
			var offset = element.nextSibling;
			var func = !!offset ? insertBefore : appendChild;
            for(var i = 0, il = elements.length; i < il; i++){
            	func(parent, elements[i], offset);
            }
		}),
		/**
		* 将元素从文档中分离
		* @method detach
		* @chainable
		*/
		detach: each(function(targetElement){
			if (targetElement.parentNode) 
				targetElement.parentNode.removeChild(targetElement);
		}),
		/**
		 * 监听事件
		 * @param name {String} 监听的事件名称
		 * @param listenerfn {Function} 事件处理方法
		 * @chainable
		 */
		on: each(function(name, listenerfn, option) {
			KolaDomEvent.on(element, name, listenerfn,option);
		}),
		/**
		 * 取消对事件的监听
		 * @param [name] {String} 监听的事件名称
		 * @param [listenerfn] {Function} 事件处理方法
		 * @chainable
		 */
		off: each(function(name, listenerfn) {
			if(name == "mouseleave")
				name = "mouseout";
			if(name == "mouseenter")
				name = "mouseover";
			KolaDomEvent.off(element, name, listenerfn);
		}),
		/**
		 * 触发事件
		 * @param name {String} 事件名称
		 * @chainable
		 */
        fire: each(function(name){
			KolaDomEvent.fire(element, name);
        }),
		/**
		* 判断元素是否符合选择器
		* @method is
		* @param selector {String} 选择器
		* @return {Boolean}
		*/
		is: read(function(targetElement, selector){
			return Selector.matchesSelector(targetElement, selector)
		}),
		/**
		* 返回当前元素在同级元素中是第几个
		* @method index
		* @param selector {String} 选择器,如果提供，则返回当前元素在同级中符合条件的节点中是第几个
		* @return {Boolean}
		*/
		index: read(function(targetElement, selector){
			if(selector)
                return KolaArray.indexOf(exports(elem.parentNode).children(selector),elem);
            else
                return KolaArray.indexOf(elem.parentNode.children,elem);
		}),
		/**
		 * 获取对象的位置，相对于其定位对象的位置
		 * @method pos
		 * @return {Object} left,top表示元素相对于其定位的坐标
		 */
		pos: read(function(targetElement) {
			return {
				left: targetElement.offsetLeft,
				top: targetElement.offsetTop
			};
		}),
		/**
		 * 获取对象在页面上的绝对位置
		 * @method pagePos
		 * @return {Object} left,top表示元素相对于其定位的坐标
		 */
		pagePos: read(function(targetElement) {
			var left = 0,
			top = 0,
			doc = document,
			de = doc.documentElement,
			db = doc.body,
			add = function(l, t) {
				left += l || 0;
				top += t || 0;
			};
			
			if (targetElement.getBoundingClientRect) {
				//	存在方法直接获取位置，那就直接获取之
				
				var box = targetElement.getBoundingClientRect();
				add(box.left + Math.max(de.scrollLeft, db.scrollLeft) - de.clientLeft,
						box.top + Math.max(de.scrollTop, db.scrollTop) - de.clientTop);
			} else {
				//	只能进行位置累加获取
				
				var op = targetElement.offsetParent,
					parent = targetElement.parentNode;
					
				add(targetElement.offsetLeft, targetElement.offsetTop);
				
				//	逐个累加每个offsetParent的位置
				while (op) {
					add(op.offsetLeft, op.offsetTop);
					op = op.offsetParent;
				}

				//	循环所有parentNode
				while (parent && parent.tagName && !isBody.test(parent.tagName) ) {
					add(-parent.scrollLeft, -parent.scrollTop);
					parent = parent.parentNode;
				}
			}
			return {left: left, top: top};
		}),
		/**
		 * 获取第一个对象的位置，相对于浏览器窗口区域的位置
		 * @return 位置
		 * @type Object
		 */
		clientPos: read(function(targetElement) {
            var pos = Operation.pagePos(targetElement),
                db = document.body,
                de = document.documentElement;
            return {
                left: pos.left - Math.max(db.scrollLeft, de.scrollLeft),
                top: pos.top - Math.max(db.scrollTop, de.scrollTop)
            };
		}),
		/**
		 * 获取第一个对象的宽度
		 * @return 宽度
		 * @type Number
		 */
		width: read(function(targetElement){
            return targetElement.offsetWidth+
                parseInt(this.style("padding-left") || "0")+
                parseInt(this.style("padding-right") || "0")+
                parseInt(this.style("border-left") || "0")+
                parseInt(this.style("border-right") || "0");
        }),
		/**
		 * 获取第一个对象的高度
		 * @return 高度
		 * @type Number
		 */
		height: read(function(targetElement){
            return targetElement.offsetHeight+
        	    parseInt(this.style("padding-top") || "0")+
        	    parseInt(this.style("padding-down") || "0")+
        	    parseInt(this.style("border-top") || "0")+
        	    parseInt(this.style("border-down") || "0");
        }),
		/**
		 * 获取在页面中的绝对位置和大小信息
		 */
		bound: read(function(targetElement) {
			if (targetElement.getBoundingClientRect) {
				return targetElement.getBoundingClientRect();
			} else {
				var box = {};
				box = Operation.clientPos(targetElement);
				box.width = Operation.width(targetElement);
				box.height = Operation.height(targetElement);
				box.right = box.left + box.width;
				box.bottom = box.top + box.height;
			}
			return box;
		})
	}
	var exports = KolaClass(Dispatcher, {
		__ME: function(selector){
			if(KolaClass.isString(selector) && selector.charAt(0) != '<'){
				/*
					define DomRefer Array<HTMLElement>|NodeList|HtmlCollection|HtmlElement|KolaElement|String
				*/
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
				callback.call(this, new exports(this[i]), i);
			}
			return this;
		},

		/**
		 * 增加一些元素
		 * @method add
		 * @param sets {DomRefer} 要增加的dom集合
		 * @chainable
		 */
		add: function(sets){
			var elements = toElements(sets);
			for(var i = 0, il = elements.length; i < il ; i ++){
				this[this.length] = elements[i];
			}
			this.length += elements.length;
			unique(this);
			return this;
		},

		/**
		 * 移除一些元素
		 * @method remove
		 * @param sets {DomRefer} 要移除的dom集合
		 * @chainable
		 */
		remove: function(sets){
			var elements = toElements(sets);
			for(var i=0, il = elements.length; i < il; i++){
				for(var j=0, jl = this.length; j < jl; j++){
					if(this[j] == elements[i]){
						this.splice(j,1);
					}
				}
			}
			return this;
		},
		/**
		 * 隐藏元素
		 * @method hide
		 * @chainable
		 */
		hide:function(){
			return this.addClass("___Kola___Hidden");
		},
		
		/**
		 * 显示元素
		 * @method show
		 * @chainable
		 */
		show:function(){
			return this.removeClass("___Kola___Hidden");
		},
		//使得浏览器认为实例是一个数组，方便调试
		splice:[].splice
	});
	//定义一个针对节点读取属性或设置属性的操作
	function elementAttr(get, set){
		var lengthGroup = [];
		lengthGroup[get.length - 1] = {isGet:true,fn:get};
		lengthGroup[set.length - 1] = {isGet:false,fn:set};
		return lengthGroup;
	}
	//针对节点读取属性或设置属性的操作的公共部分
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
	//定义一个针对节点设置属性的操作
	function content(fn){
		return {
			type: "content",
			fn: fn
		}
	}
	//针对节点设置属性的操作的共用部分
	function contentOperater(functionName, operater){
		exports.prototype[functionName] = function(value){
			for(var i = 0; i < this.length; i++){
				operater.fn.call(this, this[i], toElements(value||[]));
			}
			return this
		}
	}
	//定义一个针对节点设置属性的操作
	function each(fn){
		return {
			type: "each",
			fn: fn
		}
	}
	//针对节点设置属性的操作的共用部分
	function eachOperater(functionName, operater){
		exports.prototype[functionName] = function(value, p0, p1){
			for(var i = 0; i < this.length; i++){
				operater.fn.call(this, this[i], p0, p1);
			}
			return this;
		}
	}
	//定义一个针对节点设置属性的读取操作
	function read(fn){
		return {
			type: "read",
			fn: fn
		}
	}
	//针对节点设置属性的读取操作的共用部分
	function readOperater(functionName, operater){
		exports.prototype[functionName] = function(value){
			if(this.length == 0)
				return;
			return operater.fn.call(this, this[0], value);
		}
	}
	//定义一个针对dom树遍历的操作
	function traveller(fn){
		return {
			type: "traveller",
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
	//元素操作
	for(key in Operation){
		var item = Operation[key];
		if(KolaClass.isArray(item)){ //item 是数组，为重载函数
			overloadOperater.call(this, key, item);
		}else{
			if(item.type == "traveller"){
				travellerOperater.call(this, key, item);
			}else if(item.type == "content"){
				contentOperater.call(this, key, item);
			}else if(item.type == "each"){
				eachOperater.call(this, key, item);
			}else if(item.type == "read"){
				readOperater.call(this, key, item);
			}
		}
	}
	KolaArray.forEach('click,mouseover,mouseout,mouseup,mousedown,mousemove,keyup,keydown,keypress,focus,blur,submit,change'.split(','),function(name){
        exports.prototype[name] = function(listenerfn,option){
            for(var i = 0; i < this.length; i++){
                if(!listenerfn){
                    if(name=="submit")
                        this[i].submit();
                    if(name=="focus")
                        this[i].focus();
                    else
                        KolaDomEvent.fire(this[i], name);
                }else{
                    KolaDomEvent.on(this[i], name, listenerfn, option);
                }
			}
            return this;
        }
    });
    exports.prototype.mouseenter = function(listenerfn, option){
		option = option||{}
		option._definer = listenerfn;
        this._each( function(element) {
			E.on(element,"mouseover", function(e){
                var from=e.relatedTarget;
                var to=element;
                while (from) {
                    if (from == to) return;
                    from = from.parentNode;
                }
                listenerfn.call(this, e, option);
            },option);
		});
    },
    exports.prototype.mouseleave = function(listenerfn, option){
		option = option||{}
		option._definer = listenerfn;
        this._each( function(element) {
			E.on(element,"mouseout", function(e){
                var from=e.relatedTarget;
                var to=element;
                while (from) {
                    if (from == to) return;
                    from = from.parentNode;
                }
                listenerfn.call(this, e, option);
            },option);
		});
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
			array.length = top;
		}
		return array;
	}
	/*
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
	 * @private
	 * @return {String}
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
	/*
	 * 在父元素的所有子元素之后添加一个元素
	 */
	var appendChild = function(parent, child) {
		if (parent.tagName.toLowerCase() == 'table' && child.tagName.toLowerCase() == 'tr') {
			if (parent.tBodies.length == 0) {
				parent.appendChild(document.createElement('tbody'));
			}
			parent = parent.tBodies[0];
		}
		//	如果要添加的节点是DocumentFragment，那就进行特殊处理
		if ( child.nodeType === 11 ) {
			var length = child.childNodes.length;
			parent.appendChild(child);
			var nodes = parent.childNodes, news = [];
			for ( var j = nodes.length, i = j - length; i < j; i++ ) {
				news.push( nodes[i] );
			}
			return news;
		}
		return parent.appendChild(child);
	};

	/*
	 * 在父元素的所有子元素之后添加一个元素
	 */
	var insertBefore = function(parent, child, before) {
		if (parent.tagName.toLowerCase() == 'table' && child.tagName.toLowerCase() == 'tr') {
			if (parent.tBodies.length == 0) {
				parent.appendChild(document.createElement('tbody'));
			}
			parent = parent.tBodies[0];
		}
		return parent.insertBefore(child, before || parent.firstChild);
	};
	/*
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
	//////////////////////////////////////////////////////////////
	var KolaDomEvent = (function(){
		/********************************************** 类定义 **********************************************/

		//FIXME:给window绑定onscroll事件没有位置信息
		var copyParams=["keyCode","componentKey","shiftKey","clientX","clientY","screenX","screenY", "offsetX", "offsetY", "wheelDeltaY","wheelDeltaX","wheelDelta"];
		/*
		 * kola事件对象
		 * @prop currentTarget 绑定时没有设置option.delegate时，currentTarget为绑定该事件的元素，设置option.delegate时，currentTarget为被代理的元素
		 * @prop data: 绑定事件时传入的数据
		 * @prop event: 浏览器内置事件对象
		 * @prop button: w3c兼容
		 * @method preventDefault: w3c兼容
		 * @method stopPropagation: w3c兼容
		 * @method stop: preventDefault & stopPropagation
		 */
		if(Browser.IEStyle){
			var DomEvent = KolaClass({
				_init :function(e){
					this.event=e;
					this.target=e.srcElement;
					this.relatedTarget = ( e.fromElement == e.srcElement ? e.toElement : e.fromElement );
					if(e.button==1)
						this.button=0;
					if(e.button==4)
						this.button=1;
					if(e.button==2)
						this.button=2;
					this.pageY=e.clientY+document.documentElement.scrollTop;
					this.pageX=e.clientX+document.documentElement.scrollLeft;
					for(var i=0,il=copyParams.length;i<il;i++){
						this[copyParams[i]]=e[copyParams[i]];
					}
				},
				preventDefault:function(){this.event.returnValue=false;},
				stopPropagation:function(){this.event.cancelBubble=true;}
			});
		}else{
			var DomEvent = KolaClass({
				_init :function(e){
					this.event=e;
					this.target=e.target;
					this.button=e.button;
					this.relatedTarget = e.relatedTarget;
					this.pageX=e.pageX;
					this.pageY=e.pageY;
					for(var i=0,il=copyParams.length;i<il;i++){
						this[copyParams[i]]=e[copyParams[i]];
					}
				},
				preventDefault:function(){
					this.event.preventDefault()
				},
				stopPropagation:function(){
					this.event.stopPropagation()
				}
			});
		}
		DomEvent.prototype.stop=function(){
			this.preventDefault();
			this.stopPropagation();
		}
		
		var eventAgent = function( listenerfn, option, e ) {
			if ( B.IEStyle ) {
				e= new DomEvent(window.event);
			}else{
				e= new DomEvent(e);
			}
			if(option.out){
				var elem=e.target;
				var match=false;
				while(elem.nodeType==1 && elem!=this){
					elem = elem.parentNode;
				}
				e.currentTarget = this;
				if(elem!=this)
					listenerfn.call( option.scope||this, e );
				return;
			}
			//当前事件是代理
			if(option.delegate){
				var elem=e.target;
				var match=false;
				while(elem.nodeType==1 && elem!=this){
					if(Selector.matchesSelector(elem,option.delegate)){
						match=elem;
						break;
					}
					elem = elem.parentNode;
				}
				//若target不是delegate的一部分，则放弃事件
				if(!match)
					return;
				e.currentTarget = elem;
			}else{
				e.currentTarget = this;
			}
			if(!KolaClass.isUndefined(option.data))
				e.data=option.data;
			
			listenerfn.call( option.scope||this, e );
		};
		//light bind
		function eventBind(callbackfn,scope,listenerfn,option) {
			return function(e) {
				return callbackfn.call(scope,listenerfn,option,e);
			};
		}
		//删除指定的事件
		var remove = function( element, name, listenerfn, obj ) {
			//	删除listener
			if ( element.removeEventListener ) {
				if(obj.o.out)
					document.removeEventListener( name, listenerfn, false );
				else
					element.removeEventListener( name, listenerfn, false );
			} else {
				//	如果是监听checkbox input的onchange事件，那就需要监听替代的事件。这样做主要是解决，ie9之前，点击checkbox input时，并不会马上出发onchange事件，而是在失焦后出发onchange事件的问题
				if ( name == 'change' && element.tagName && element.tagName.toLowerCase() == 'input' && element.type == 'checkbox' ) {
					CheckboxChange.off( element, obj );
				} else {
					if(obj.o.out)
						document.detachEvent( "on"+name, listenerfn );
					else
						element.detachEvent( "on"+name, listenerfn );
				}
			}
		};

		//常见的inline事件
		var inlineEvents = [
			'onclick', 'ondblclick', 'onmouseover', 'onmouseout', 'onmouseup', 'onmousedown',
			'onblur', 'onfocus', 'onchange', 'onsubmit'
		];

		var KEvent = {
			/*
			 * 监听一个事件
			 * @param {kolaElement} element 要绑定事件的元素
			 * @param {String} name 事件名称
			 * @param {function} listenerfn 事件的处理函数
			 * @param {object} option 配置参数
					@option {object} scope 指定处理函数的this，如果没有，则默认为element
					@option {ANY} data 绑定事件时附带的参数，事件处理时会附加在event.data中
					@option {selector} delegate 代理事件，如果设置，只有符合该选择器的子元素才会触发事件，并且currentTarget指向被代理的元素
					@option {Boolean} out 指定事件在当前元素之外触发
			 */
			on: function(element, name, listenerfn, option) {
				if ( !element || !name || !listenerfn ) return this;
				option=option||{};
				//	如果是IE7下触发unload事件，那就直接设置方法
				if ( name == 'unload' && element == window && B.IE67 ) {
					element.onunload = listenerfn;
					return this;
				}

				//	如果不存在事件存储器的话，那就建立之
				var events = element.__events;
				if( !events ) {
					events = element.__events = {};
				}

				//	如果不存在指定类型的事件存储器，那就建立之
				var eventType = events[ name ];
				if( !eventType ) {
					eventType = events[ name ] = [];
				}

				var obj;

				//	建立替代方法，主要是设定作用域
				obj = {
					l: option._definer||listenerfn,
					h: eventBind(eventAgent, element, listenerfn, option),
					o: option
				};

				//	缓存事件处理方法
				eventType.push( obj );
						
				//	绑定事件
				if ( !Browser.IEStyle ) {
					if(option.out){
						document.addEventListener( name, obj.h, false );
					}else{
						element.addEventListener( name, obj.h, false );
					}
				} else {
					//	如果是监听checkbox input的onchange事件，那就需要监听替代的事件。这样做主要是解决，ie9之前，点击checkbox input时，并不会马上出发onchange事件，而是在失焦后出发onchange事件的问题
					if ( name == 'change' && element.tagName && element.tagName.toLowerCase() == 'input' && element.type == 'checkbox' ) {
						CheckboxChange.on( element, obj.h, obj );
					} else {
						if(option.out)
							document.attachEvent( 'on' + name, obj.h );
						else
							element.attachEvent( 'on' + name, obj.h );
					}
				}
						
				return this;
			},
			
			/*
			 * 取消元素的所有事件绑定
			 * @param {kolaElement} element 要解除事件绑定的元素
			 */
			
			/*
			 * 取消元素的某个类型事件绑定
			 * @param {kolaElement} element 要解除事件绑定的元素
			 * @param {String} name 要解除事件绑定的类型
			 */
			
			/*
			 * 取消元素的指定事件处理
			 * @param {kolaElement} element 要解除事件绑定的元素
			 * @param {String} name 要解除事件绑定的类型
			 * @param {Function} listenerfn 要解除事件绑定的处理函数
			 */
			off: function( element, name, listenerfn, out) {
				if ( !element ) return this;

				//	如果不存在事件缓存，那就不做处理
				var events = element.__events;
				if( !events ) return this;
				
				//	如果不存在要移除的事件，那就是移除所有事件
				var listeners;
				if ( typeof name == 'undefined' ) {
					//	移除所有事件
					for ( var key in events ) {
						if ( key == 'out' ) {
							//	如果是out事件，那就删除所有out事件
							KEvent.unout( element );
						} else {
							if(out){
								this.off(document, name, listenerfn);
								return this;
							}
							listeners = events[ key ];
							if ( typeof listeners != 'object' || ( listeners == null ) || !listeners.length ) continue;
							
							//	循环取消所有事件监听
							for ( var i = listeners.length - 1; i >= 0; i-- ) {
								var listener = listeners[i];
								remove( element, key, listener.h, listener );
							}
						}
					}
					
					//	删除常见的inline事件
					for ( var j = inlineEvents.length - 1; j >= 0; j-- ) {
						element[ inlineEvents[ i ] ] = null;
					}
					
					//	清除事件缓存
					element.__events = null;
					element.__events = undefined;
				} else {
					//	移除指定事件的监听
					
					//	如果不存在该类型的事件存储器，那就不做处理
					listeners = events[name];
					if( !listeners ) return this;

					if( listenerfn ) {
						//	这是要取消指定的监听方法
		
						//	循环所有存储的事件处理方法，如果相同，那就删除之
						for( var i = listeners.length - 1; i >= 0; i-- ) {
							var eventObj = listeners[i];
							if ( eventObj.l == listenerfn ) {
								remove( element, name, eventObj.h, eventObj );
								listeners.splice( i, 1 );
								break;
							}
						}
			
					} else {
						//	删除所有监听事件
						for( var i = 0, il = listeners.length; i < il; i++ ) {
							remove( element, name, listeners[i].h, listeners[i] );
						}
		
						//	删除缓存
						delete events[name];
					}		
					return this;
				}
			},
			/*
			 * 派发事件
			 * @param element
			 * @param name
			 * @param event
			 */
			fire: function( element, name, event ) {
				if(B.IEStyle) {  
					element.fireEvent("on"+name);  
				}else{  
					var evt = document.createEvent('HTMLEvents');  
					evt.initEvent(name,true,true);  
					element.dispatchEvent(evt);  
				}
			}
		};

		/* ---------------------------------- checkbox input change事件的特殊处理程序 ----------------------------------------*/

		var CheckboxChange = {

			/*
			 * 监听方法
			 */
			on: function( element, listenerfn, obj ) {
				//	设定两个方法
				var clickfn = KolaFunction.bind( CheckboxChange.fire, this, element, listenerfn );
				var keypressfn = KolaFunction.bind( CheckboxChange.keypress, this, element, listenerfn );

				//  记录监听方法
				obj.click = clickfn;
				obj.keypress = keypressfn;

				//  监听替代变量
				Event.on( element, 'click', clickfn );
				Event.on( element, 'keypress', keypressfn );
			},

			/*
			 * 取消对元素的替代事件的监听
			 */
			off: function( element, obj ) {
				Event.off( element, 'click', obj.click );
				Event.off( element, 'keypress', obj.keypressfn );
			},

			/*
			 * keypress事件的处理方法
			 */
			keypress: function( element, listenerfn, e ) {
				//	如果当前按的是空格，那就触发onchange事件
				if ( e.keyCode == 32 ) {
					CheckboxChange.fire( element, listenerfn );
				}
			},

			/*
			 * 触发change事件
			 */
			fire: function( element, listenerfn ) {
				//	循环每个监听change的处理器，调用之执行
				KolaArray.forEach( element.__events[ 'change' ], function( obj ) {
					var e = {
						srcElement: element,
						type: 'change'
					};
					obj.h( e );
				} );
			}
		};
		return KEvent;
	})()
	return exports;
});