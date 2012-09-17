/**
 * kola html Element 包，提供dom元素的封装
 * 
 * @module kola.html
 */

kola('kola.html.Element',[
	'kola.lang.Class',
	'kola.lang.Array',
	'kola.lang.Function',
	'kola.lang.String',
	'kola.html.util.Selector',
	'kola.html.util.Event'
],function(KolaClass, KolaArray, KolaFunction, KolaString, Selector, KolaDomEvent){
	var IEStyle = (navigator.userAgent.indexOf('MSIE') != -1 && parseInt(navigator.userAgent.substr(navigator.userAgent.indexOf( 'MSIE' ) + 5, 3)) < 9);
	//用于element.data的存储
	var cache = {};
	//使用随机名称，防止冲突
	var cache_attr_name = 'kola' + new Date().getTime();
	//从1开始，方便检测
	var cacheSize = 1;
	
	var Operation = {
		/**
		 * 获取某个属性值
		 * @method attr
		 * @param name {String} 属性名
		 * @return {String} 属性值
		 */
		getattr: function(targetElement, name){
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
					if (IEStyle){
						if(typeof(value) == 'object' && value != null) {
							value = targetElement.attributes.getNamedItem(name);
							return !!value ? value.value : null;
						}else{
							if(KolaClass.isUndefined(value))
								return;
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
		setattr: function(targetElement, name, value){
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
					if (IEStyle && name.indexOf('on') == 0) {
						//	如果是字符串，需要转换成一个方法，ie下只能接受方法
						if (typeof(value) == 'string') {
							value = new Function(value);
						}
						targetElement[name] = value;
					} else {
						targetElement.setAttribute(name, "" + value);
					}
			}
		},
		/**
		 * 获取某个原生属性值
		 * @method prop
		 * @param name {String} 属性名
		 * @return {String} 属性值
		 */
		getprop: function(targetElement, name){
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
		setprop: function(targetElement, name, value){
			targetElement[name] = value;
		},
		/**
		 * 得到某个元素的附加数据
		 * @method data
		 * @param name {String} 要设置的数据的名称
		 * @return {Any} dom上name对应的数据
		 */
		getdata: function (targetElement, name) {
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
		setdata: function (targetElement, name, value) {
			index = targetElement[cache_attr_name];
			if(name === undefined && index){
				cache[index] = undefined;
				targetElement[cache_attr_name] = undefined;
			}else if(value === undefined && index && cache[index]){
				cache[index][name] = undefined;
			}else{
				if(!index){
					index = cacheSize++;
					targetElement[cache_attr_name] = index;
				}
				if(!cache[index])
					cache[index] = {};
				cache[index][name] = value;
			}
		},
		/**
		 * 查询一个元素的类名
		 * @method css
		 * @param name {String} 要设置的类名的名称
		 * @return {Boolean} 该类名是否存在
		 */
		getcss: function (targetElement, name) {//这是要查询一个类名
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
		setcss: function (targetElement, name, value) {
			var className = targetElement.className;
			if(!value){//这是要删除一个类名
				if ((' ' + className + ' ').indexOf(' ' + name + ' ') != -1) {
					targetElement.className = KolaString.trim(className.split(name).join(' ').replace(/[ ]{2,}/g,' '));
				}
			}else if((' ' + className + ' ').indexOf(name) == -1){//这是要增加一个类名
				targetElement.className += ' ' + name;
			}
		},
		/**
		 * 查询一个元素的样式
		 * @method style
		 * @param name {String} 要设置的样式的名称
		 * @return {String|Number} 样式的值
		 */
		getstyle: function (targetElement, name) {
			var st = targetElement.style;
			if(name == 'opacity'){
				var filter;
				if(IEStyle){
					return st.filter.indexOf('opacity=') >= 0 ? parseFloat(st.filter.match(/opacity=([^)]*)/)[1]) / 100 : 1;
				}else{
					return (filter = st.opacity) ? parseFloat(filter) : 1;
				}
			}else{
				return getComputedStyle(targetElement, name);
			}
		},
		/**
		* 设置一个元素的样式
		* @method style
		* @param name {String|Undefined} 要设置的类名的名称
		* @param value {Boolean} 对类名的操作：true:增加类名 false:移除类名
		* @chainable
		*/
		setstyle: function (targetElement, name, value) {
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
				if(IEStyle){
					elementStyle.filter = 'Alpha(Opacity=' + value*100 + ')'; 
				}else{
					elementStyle.opacity = (value == 1 ? '' : '' + value);
				}
			}else{
				//如果是数字，自动加px
				var newValue = parseFloat(value);
				if(newValue == value && !noPx[name])
					value = value + 'px';
				elementStyle[name] = value;
			}
		},
		/**
		 * 查询一个表单的值
		 * @method val
		 * @return {String} 样式的值
		 */
		getval: function (targetElement) {
			return targetElement.value;
		},
		/**
		 * 设置一个表单的值
		 * @method val
		 * @param value {String} 样式的值
		 * @chainable
		 */
		setval: function (targetElement, value) {
			targetElement.value = value;
		},
		/**
		 * 查询一个元素的内部html
		 * @method html
		 * @return {String} 内部的html
		 */
		gethtml: function (targetElement) {
			return targetElement.innerHTML;
		},
		/**
		 * 设置一个元素的内部html
		 * @method html
		 * @param value {String} 内部的html
		 * @chainable
		 */
		sethtml: function (targetElement, value) {
			if (IEStyle) {
				//	ie下直接调用替代方法
				innerHtml(targetElement, value);
			} else {
				//	首先调用原生方法，如果出错的话，那就调用替代方法
				try {
					targetElement.innerHTML = value;
				} catch(e) {
					innerHtml(targetElement, value);
				}
			}
			//Dispatcher.global.fire({type: 'DOMNodeInserted', data: targetElement.childNodes});
		},
		/**
		 * 查询一个元素的html(包含元素自身)
		 * @method outerHtml
		 * @return {String}
		 */
		getouterHtml: function(element){
			return element.outerHTML;
		},
		/**
		 * 设置一个元素的html(包含元素自身)
		 * @method outerHtml
		 * @param value {String} 要设置的html
		 * @chainable
		*/
		setouterHtml: function(element, value){
			var newElements = toElements(value)
			Operation.before(element, newElements);
			Operation.detach(element);
			return newElements;
		},
		/**
		 * 查询一个元素的内部文本
		 * @method text
		 * @return {String}
		 */
		gettext: function (targetElement) {
			return typeof(targetElement.innerText) != 'undefined' ? targetElement.innerText : targetElement.textContent;
		},
		/**
		 * 设置一个元素的内部文本
		 * @method text
		 * @param value {String} 内部的文本
		 * @chainable
		 */
		settext: function (targetElement, value) {
			typeof(targetElement.innerText) != 'undefined' ? 
				targetElement.innerText = value :
				targetElement.textContent = value;
		},
		////////////////////////////////////////////////////////////////////
		/**
		 * 得到父元素
		 * @method parent
		 * @return {KolaElement} 新的元素集合
		 */
		parent: function (targetElement) {
			return targetElement.parentNode;
		},
		/**
		 * 得到祖先元素
		 * @method parents
		 * @param [selector] {String} 过滤器，用于过滤得到的结果
		 * @return {KolaElement} 新的元素集合
		 */
		parents: function (targetElement, selector) {
			var nodes = [];
			while ((targetElement = targetElement.parentNode) && (targetElement.nodeType == 1)) {
				nodes.push(targetElement);
			}
			if(selector)
				return Selector(selector, nodes);
			return nodes;
		},
		/**
		 * 从当前元素开始向文档根部查找，得到第一个符合条件的元素
		 * @method closest
		 * @param selector {String|Array[]} 用于指定查找的条件
		 * @return {KolaElement} 新的元素集合
		 */
		closest: function (targetElement, selector) {
			//如果是选择器，则找到符合选择器的元素
			if(typeof selector == 'string'){
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
		},
		/**
		 * 得到下一级元素
		 * @method children
		 * @param [selector] {String} 过滤器，用于过滤得到的结果
		 * @return {KolaElement} 新的元素集合
		 */
		children: function (targetElement, selector) {
			return Selector.matches(selector, Array.prototype.slice.call(targetElement.children));
		},
		/**
		 * 得到元素以及元素内部符合条件的元素集合
		 * @method find
		 * @param selector {String} 选择器，用于指定要查找的元素类型
		 * @return {KolaElement} 新的元素集合
		 */
		find: function (targetElement, selector) {
			var arrs = Selector(selector, targetElement);
			if(Selector.matchesSelector(targetElement, selector))
				arrs.push(targetElement);
			return arrs;
		},
		/**
		 * 得到元素内部符合条件的元素集合
		 * @method children
		 * @param selector {String} 选择器，用于指定要查找的元素类型
		 * @return {KolaElement} 新的元素集合
		 */
		descendants: function (targetElement, selector) {
			return Selector(selector, targetElement);
		},
		/**
		 * 得到前一个符合条件的节点
		 * @method prev
		 * @param [selector] {String} 选择器，如果提供，则得到元素前第一个符合条件的节点
		 * @return {KolaElement} 新的元素集合
		 */
		prev: function (targetElement, selector){
			while(targetElement = targetElement.previousSibling){
				if (targetElement.nodeType == 1) {
					if(!selector || Selector.matchesSelector(targetElement, selector))
						return targetElement;
				}
			}
		},
		/**
		 * 得到后一个符合条件的节点
		 * @method next
		 * @param [selector] {String} 选择器，如果提供，则得到元素后第一个符合条件的节点
		 * @return {KolaElement} 新的元素集合
		 */
		next: function (targetElement, selector){
			while(targetElement = targetElement.nextSibling){
				if (targetElement.nodeType == 1){
					if(!selector || Selector.matchesSelector(targetElement, selector))
						return targetElement;
				}
			}
		},
		///////////////////////////////////////////////////////////////////////
		/**
		* 在元素内部尾部增加一些dom
		* @method append
		* @param elements {DomRefer} 要增加的dom
		* @chainable
		*/
		append: function(targetElement, elements){
			elements = toElements(elements);
			for(var i = 0, il = elements.length; i < il; i++){
				appendChild(targetElement, elements[i]);
			}
		},
		/**
		* 在元素内部头部增加一些dom
		* @method prepend
		* @param elements {DomRefer} 要增加的dom
		* @chainable
		*/
		prepend: function(targetElement, elements){
			elements = toElements(elements);
			var offset = targetElement.firstChild || null;
			for(var i = 0, il = elements.length; i < il; i++){
				insertBefore(targetElement, elements[i], offset);
			}
		},
		/**
		* 在元素外部前面增加一些dom
		* @method before
		* @param elements {DomRefer} 要增加的dom
		* @chainable
		*/
		before: function(targetElement, elements){
			elements = toElements(elements);
			var parent = targetElement.parentNode;
			for(var i = 0, il = elements.length; i < il; i++){
				insertBefore(parent, elements[i], targetElement);
			}
		},
		/**
		* 在元素外部后面增加一些dom
		* @method after
		* @param elements {DomRefer} 要增加的dom
		* @chainable
		*/
		after: function(targetElement, elements){
			elements = toElements(elements);
			var parent = element.parentNode;
			var offset = element.nextSibling;
			var func = !!offset ? insertBefore : appendChild;
			for(var i = 0, il = elements.length; i < il; i++){
				func(parent, elements[i], offset);
			}
		},
		/**
		* 将元素从文档中分离
		* @method detach
		* @chainable
		*/
		detach: function(targetElement){
			if (targetElement.parentNode) 
				targetElement.parentNode.removeChild(targetElement);
		},
		/*
		 * 监听一个事件
		 * @method on
		 * @param name {String} 事件名称
		 * @param listenerfn {function} 事件的处理函数
		 * @param [option] {object}  配置参数
				@option [option.scope] {object} 指定处理函数的this，如果没有，则默认为element
				@option [option.data] {ANY} 绑定事件时附带的参数，事件处理时会附加在event.data中
				@option [option.delegate] {String} 代理事件，如果设置，只有符合该选择器的子元素才会触发事件，并且currentTarget指向被代理的元素
				@option [option.out] {Boolean} 指定事件在当前元素之外触发
		 */
		on: KolaDomEvent.on,
		/**
		 * 取消对事件的监听
		 * @param [name] {String} 监听的事件名称，如果没有，则取消所有类型事件的监听
		 * @param [listenerfn] {Function} 事件处理方法 如果没有，则符合name的取消所有事件监听
		 * @param [option] {Object} 对解绑事件的描述
		 * 	@param [option.out] {Boolean} 解绑对dom之外的侦听
		 * @chainable
		 */
		off: KolaDomEvent.off,
		/**
		 * 触发事件
		 * @param name {String} 事件名称
		 * @chainable
		 */
		fire: KolaDomEvent.fire,
		/**
		* 判断元素是否符合选择器
		* @method is
		* @param selector {String} 选择器
		* @return {Boolean}
		*/
		is: function(targetElement, selector){
			return Selector.matchesSelector(targetElement, selector)
		},
		/**
		* 返回当前元素在同级元素中是第几个
		* @method index
		* @param selector {String} 选择器,如果提供，则返回当前元素在同级中符合条件的节点中是第几个
		* @return {Boolean}
		*/
		index: function(targetElement, selector){
			if(selector)
				return KolaArray.indexOf(Operation(elem.parentNode).children(selector),elem);
			else
				return KolaArray.indexOf(elem.parentNode.children,elem);
		},
		/**
		 * 获取对象的位置，相对于其定位对象的位置
		 * @method pos
		 * @return {Object} left,top表示元素相对于其定位的坐标
		 */
		pos: function(targetElement) {
			return {
				left: targetElement.offsetLeft,
				top: targetElement.offsetTop
			};
		},
		/**
		 * 获取对象在页面上的绝对位置
		 * @method pagePos
		 * @return {Object} left,top表示元素相对于其定位的坐标
		 */
		pagePos: function(targetElement) {
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
				while (parent && parent.tagName && !isBody.test(parent.tagName)) {
					add(-parent.scrollLeft, -parent.scrollTop);
					parent = parent.parentNode;
				}
			}
			return {left: left, top: top};
		},
		/**
		 * 获取第一个对象的位置，相对于浏览器窗口区域的位置
		 * @return 位置
		 * @type Object
		 */
		clientPos: function(targetElement) {
			var pos = Operation.pagePos(targetElement),
				db = document.body,
				de = document.documentElement;
			return {
				left: pos.left - Math.max(db.scrollLeft, de.scrollLeft),
				top: pos.top - Math.max(db.scrollTop, de.scrollTop)
			};
		},
		/**
		 * 获取对象的宽度
		 * @param [boundary] {Stirng} 以什么区域界定边界， inner:只有内部;padding:包括padding;border:包括border
		 * @return 宽度
		 * @type Number
		 */
		width: function(targetElement, boundary){
			var width = targetElement.offsetWidth;
			if(!boundary || boundary == "inner")
				return width;
			width += parseFloat(this.style("padding-left") || "0") + parseFloat(this.style("padding-right") || "0")
			if(boundary == "padding")
				return width;
			width += parseFloat(this.style("border-left") || "0") + parseFloat(this.style("border-right") || "0")
			return width;
		},
		/**
		 * 获取对象的高度
		 * @param [boundary] {Stirng} 以什么区域界定边界， inner:只有内部;padding:包括padding;border:包括border
		 * @return 高度
		 * @type Number
		 */
		height: function(targetElement, boundary){
			var height = targetElement.offsetWidth;
			if(!boundary || boundary == "inner")
				return height;
			height += parseFloat(this.style("padding-top") || "0") + parseFloat(this.style("padding-bottom") || "0")
			if(boundary == "padding")
				return height;
			height += parseFloat(this.style("border-top") || "0") + parseFloat(this.style("border-bottom") || "0")
			return height;
		},
		/**
		 * 获取在页面中的绝对位置和大小信息
		 */
		bound: function(targetElement) {
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
		},
		toElements: toElements
	};
	/*
	 * 得到元素数组
	 * @method toElements
	 * @private
	 * @param selector {Array<HTMLElement>|HTMLElement|String} 
	 * @return {Array<HTMLElement>}
	 */
	function toElements(selector){
		//	如果为html字符串
		if(typeof selector === "string"){
			var newDom = document.createElement('div');
			newDom.innerHTML = selector;
			var arr = [];
			for(var i = newDom.children.length - 1; i >= 0; i --){
				arr[i] = newDom.children[i];
			}
			//Dispatcher.global.fire({type: 'DOMNodeInserted',data: arr});
			return arr;
		}
		// 如果是window
		if(selector == window)
			return [selector];
		//	如果为HTMLElement
		if (selector.nodeType === 1) 
			return [selector];
		// 如果为document或document-fragment
		if(selector.nodeType === 9 || selector.nodeType === 11){
			if(selector.documentElement)
				selector = selector.documentElement;
			return [selector];
		}
		//	如果为html数组
		//if(selector.length && selector[0].nodeType){
		//	return selector;
		//}
		//	如果为HTMLCollection的话，那就返回之
		if (selector.length != undefined) {
			var array = [];
			for (var i = 0, il = selector.length; i < il; i ++) {
				if(selector[i].nodeType === 1)
					array.push(selector[i]);
			}
			return array;
		}
	}
	//将驼峰式转换为css写法
	function hyphenate(name) {
		return name.replace(/[A-Z]/g, function(match) {
			return '-' + match.toLowerCase();
		});
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
			if (name == 'display') return 'none';
		}
		if (element.currentStyle) {
			return element.currentStyle[name];
		}
		return element.style[name];
	}
	//不需要增加px的属性名称集合
	var noPx={
		'zIndex': true,
		'fontWeight': true,
		'opacity': true,
		'zoom': true,
		'lineHeight': true
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
		if (child.nodeType === 11) {
			var length = child.childNodes.length;
			parent.appendChild(child);
			var nodes = parent.childNodes, news = [];
			for (var j = nodes.length, i = j - length; i < j; i++) {
				news.push(nodes[i]);
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
		purgeChildren(el);
		
		//	这里主要对table,select进行特殊处理，还有其他元素待处理
		var translations = {
				table: 	[1, '<table>', '</table>'],
				select: [1, '<select>', '</select>'],
				tbody: 	[2, '<table><tbody>', '</tbody></table>'],
				tr: 	[3, '<table><tbody><tr>', '</tr></tbody></table>']
			},
			tagName = el.tagName.toLowerCase(),
			wrap = translations[tagName];

		if (wrap) {
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
			while (node = wrapper.firstChild) {
				appendChild(el, node);
			}

			//	如果是ie9以前的版本，并且设置的是select，那就默认聚焦到第一个。这主要是解决ie9之前的版本都是默认设置到最后一个，而别的浏览器级版本都是聚焦到第一个
			if (tagName == 'select' && IEStyle) {
				el.selectedIndex = 0;
			}
		}else{
			el.innerHTML = value;
		}

		return el.childNodes;
	};
	//移除某个节点所有子孙节点对js的引用，避免内存泄露
	if(IEStyle){//IE6,7需要移除所有事件
		var purgeChildren = function(element) {
			var nodes = element.all,count;
			for (var i = nodes.length - 1; i >= 0; i--){
				KolaDomEvent.off(nodes[i]);
				node[cache_attr_name] = null;
			}
		};
		//如果会引起内存泄露，那就跟踪unload事件，处理这些
		KolaDomEvent.on(window, 'unload', function(){
			purgeChildren(document);
		});
	}else{
		var purgeChildren = KolaFunction.empty;
	}
	/**
	 * kola的KolaElement类
	 * 
	 * @class KolaElement
	 * 
	 */
	var exports = function(elements){
		if(this.constructor != exports){
			//instanceof当涉及跨iframe时会工作不正常
			if(typeof elements === "string" && elements.charAt(0) != '<'){
				/*
					define DomRefer Array<HTMLElement>|NodeList|HtmlCollection|HtmlElement|KolaElement|String
				*/
				/**
				* 使用选择器选择特定dom
				* @function direct
				* @param elements {String}
				* @return {KolaElement}
				*/
				return new exports(Selector(elements));
			}else{
				/**
				* 根据字符串生成dom，并生成KolaElement
				* @function direct
				* @param elements {String} 要转换的字符串，以html < 格式开头
				* @return {KolaElement}
				*/
				/**
				* 将指定的dom转换为KolaElement
				* @function direct
				* @param elements {Array<HTMLElement>|NodeList|HtmlCollection|HtmlElement|KolaElement}
				* @return {KolaElement}
				*/
				return new exports(Operation.toElements(elements));
			}
		}
		/**
		* 构造函数
		* @constructor
		* @param elements {Array<HTMLElement>}
		* @return {KolaElement}
		*/
		this.length = elements.length;
		for(var i = 0, il = this.length; i < il; i ++)
			this[i] = elements[i];
	};

	exports.prototype = {
		constructor: exports,
		/**
		* 依次迭代内部dom，将内部每一个元素封装成KolaElement交给callback处理
		* @method each
		* @param callback {Function} 回调函数
		* @chainable
		*/
		each: function (callback) {
			//	使用迭代器循环每个元素
			for(var i = 0, il = this.length; i < il; i++){
				callback.call(this, new exports([this[i]]), i);
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
			var elements = Operation.toElements(sets);
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
			var elements = Operation.toElements(sets);
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
			return this.css("___Kola___Hidden", true);
		},
		
		/**
		 * 显示元素
		 * @method show
		 * @chainable
		 */
		show:function(){
			return this.css("___Kola___Hidden", false);
		},

		outerHtml: function(value){
			if (arguments.length == 0) {
				return Operation.getouterHtml(this[0])
			}else{
				for(var i = 0; i < this.length; i++){
					this[i] = Operation.setouterHtml(this[i], value)[0]
				}
				return this;
			}
		},
		//使得浏览器认为实例是一个数组，方便调试
		splice:[].splice
	};
	//定义一个针对节点读取属性或设置属性的操作
	function getSet(getFunction, setFunction){
		var functionGroup = [];
		getFunction.isGet = true;
		functionGroup[getFunction.length - 1] = getFunction;
		functionGroup[setFunction.length - 1] = setFunction;
		return functionGroup;
	}
	//getSet
	KolaArray.forEach('attr,prop,data,css,style,val,html,text'.split(','),function(functionName){
		var getSetFunction = getSet(Operation['get' + functionName], Operation['set' + functionName]);
		exports.prototype[functionName] = function(name, value){
			var operater = getSetFunction[arguments.length];
			if(operater.isGet){
				return operater.call(this, this[0], name);
			}else{
				for(var i = 0; i < this.length; i++){
					operater.call(this, this[i], name, value);
				}
				return this;
			}
		}
	});
	//first
	KolaArray.forEach('bound,height,width,clientPos,pagePos,pos,index,is'.split(','),function(functionName){
		exports.prototype[functionName] = function(value){
			if(!this[0] || this[0].nodeType != 1)
				return;
			return Operation[functionName].call(this, this[0], value);
		}
	});
	//each
	KolaArray.forEach('on,fire,off,detach,append,prepend,before,after'.split(','),function(functionName){
		exports.prototype[functionName] = function(p0, p1, p2){
			for(var i = 0; i < this.length; i++){
				Operation[functionName].call(this, this[i], p0, p1, p2);
			}
			return this
		}
	});
	//traveller
	KolaArray.forEach('parent,parents,closest,children,find,descendants,prev,next'.split(','),function(functionName){
		exports.prototype[functionName] = function(p0, p1){
			var results = [];
			for(var i = 0; i < this.length; i++){
				var res = Operation[functionName].call(this, this[i], p0, p1);
				if(KolaArray.is(res))
					results = results.concat(res);
				else if(res)
					results.push(res);
			}
			return new exports(unique(results));
		}
	});
	//shortcut for events
	KolaArray.forEach('click,mouseenter,mouseleave,mouseover,mouseout,mouseup,mousedown,mousemove,keyup,keydown,keypress,focus,blur,submit,change'.split(','),function(functionName){
		exports.prototype[functionName] = function(listenerfn,option){
			for(var i = 0; i < this.length; i++){
				if(arguments.length == 0){
					KolaDomEvent.fire(this[i], functionName);
				}else{
					KolaDomEvent.on(this[i], functionName, listenerfn, option);
				}
			}
			return this;
		}
	});
	//数组排重
	function unique(array) {
		var flag = false;
		var le = array.length;
		for(var i = 0; i < le; i++) {
			for(j = i + 1; j < le; j++) {
				if(array[i] === array[j]) {
					array[j] = null;
					flag = true;
				}
			}
		}
		if(flag) {
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
	return exports;
});