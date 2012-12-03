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
	'kola.html.util.Event',
	'kola.event.Dispatcher'
],function(KolaClass, KolaArray, KolaFunction, KolaString, Selector, KolaDomEvent, Dispatcher){
	var IEStyle = (navigator.userAgent.indexOf('MSIE') != -1 && parseInt(navigator.userAgent.substr(navigator.userAgent.indexOf( 'MSIE' ) + 5, 3)) < 9);
	//使用随机名称，防止冲突
	var data_name = 'kola' + new Date().getTime();
	var domDispatcher = new Dispatcher();
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
							if(value === undefined)
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
					targetElement.className = value.toLowerCase();
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
			var dataset = targetElement[data_name];
			if(!dataset) return undefined;
			return dataset[name];
		},
		/**
		 * 设置dom上指定的附加数据
		 * @method data
		 * @param name {String} 要删除的数据名称,如果为undefined，则表示删除全部数据
		 * @param value {Any} 指定数据的名称，如果为undefined，则删除该数据
		 * @chainable
		 */
		setdata: function (targetElement, name, value) {
			var dataset = targetElement[data_name];
			if(name === undefined && index){
				delete targetElement[data_name];
			}else if(value === undefined && dataset){
				delete dataset[name];
			}else{
				(targetElement[data_name] || (targetElement[data_name] = {}))[name] = value;
			}
		},
		/**
		 * 查询一个元素的类名
		 * @method css
		 * @param name {String} 要设置的类名的名称
		 * @return {Boolean} 该类名是否存在
		 */
		 //to do :confirm
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
			var className = ' ' + targetElement.className + ' ';
			var safeName = ' ' + name + ' '
			if(!value){//这是要删除一个类名
				if ((className).indexOf(safeName) != -1) {
					targetElement.className = KolaString.trim(className.split(safeName).join(' ').replace(/[ ]{2,}/g,' '));
				}
			}else if((className).indexOf(safeName) == -1){//这是要增加一个类名
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
			name = antihyphenate(name);
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
			name = antihyphenate(name);
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
			domDispatcher.fire("DomCreate", targetElement.children);
		},
		/**
		 * 查询一个元素的html(包含元素自身)
		 * @method getouter
		 * @return {String}
		 */
		getouter: function(element){
			return element.outerHTML;
		},
		/**
		 * 设置一个元素的html(包含元素自身)
		 * @method setouter
		 * @param value {String} 要设置的html
		 * @chainable
		*/
		setouter: function(element, value){
			var newElements = toElements(value)
			Operation.before(element, newElements);
			Operation.destroy(element);
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
		/**
		 * 获取对象的样式left
		 * @method left
		 * @return {Number}
		 */
		/**
		 * 设置对象的样式left
		 * @param value
		 * @method left
		 * @chainable
		 */
		/**
		 * 获取对象的样式top
		 * @method top
		 * @return {Number}
		 */
		/**
		 * 设置对象的样式top
		 * @method left
		 * @param value
		 * @chainable
		 */
		/**
		 * 获取对象的样式宽度
		 * @method width
		 * @return {Number}
		 */
		/**
		 * 设置对象的样式宽度
		 * @param value
		 * @method left
		 * @chainable
		 */
		/**
		 * 获取对象的样式高度
		 * @method height
		 * @return {Number}
		 */
		/**
		 * 设置对象的样式高度
		 * @param value
		 * @method left
		 * @chainable
		 */
		getleft: function(targetElement){
			return targetElement.offsetLeft;
		},
		setleft: function(targetElement, value){
			targetElement.style.left = value + 'px';
		},
		gettop: function(targetElement){
			return targetElement.offsetTop;
		},
		settop: function(targetElement, value){
			targetElement.style.top = value + 'px';
		},
		getwidth: function(targetElement){
			//如果style上面直接写了width，则直接使用
			//ISSUE: 使用getwidth时，如果在css中有带!important的宽度覆盖了style上面的值，则getwidth得到的仍然是style上面的值
			var styleWidth = targetElement.style.width;
			if(styleWidth != ''){
				return parseFloat(styleWidth);
			}
			//否则计算width
			return parseFloat(getComputedStyle(targetElement, 'width'));
		},
		setwidth: function(targetElement, value){
			targetElement.style.width = value + 'px';
		},
		getheight: function(targetElement){
			var styleHeight = targetElement.style.height
			if(styleHeight != ''){
				return parseFloat(styleHeight);
			}
			return parseFloat(getComputedStyle(targetElement, 'height'));
		},
		setheight: function(targetElement, value){
			targetElement.style.height = value + 'px';
		},
		////////////////////////////////////////////////////////////////////
		/**
		 * 得到父元素
		 * @method parent
		 * @return {Element} 新的元素集合
		 */
		parent: function (targetElement) {
			return targetElement.parentNode;
		},
		/**
		 * 得到祖先元素
		 * @method parents
		 * @param [selector] {String} 过滤器，用于过滤得到的结果
		 * @return {Element} 新的元素集合
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
		 * @return {Element} 新的元素集合
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
		 * @return {Element} 新的元素集合
		 */
		children: function (targetElement, selector) {
			var children = [];
			for(var child = targetElement.firstChild; child; child = child.nextSibling){
				if(child.nodeType == 1 && (!selector || Selector.matchesSelector(child, selector))){
					children.push(child);
				}
			}
			return children;
		},
		/**
		 * 得到元素以及元素内部符合条件的元素集合
		 * @method find
		 * @param selector {String} 选择器，用于指定要查找的元素类型
		 * @return {Element} 新的元素集合
		 */
		find: function (targetElement, selector) {
			var arrs = Selector(selector, targetElement);
			if(Selector.matchesSelector(targetElement, selector))
				arrs.push(targetElement);
			return arrs;
		},
		/**
		 * 得到元素内部符合条件的元素集合
		 * @method down
		 * @param selector {String} 选择器，用于指定要查找的元素类型
		 * @return {Element} 新的元素集合
		 */
		down: function (targetElement, selector) {
			return Selector(selector, targetElement);
		},
		/**
		 * 得到前一个符合条件的节点
		 * @method prev
		 * @param [selector] {String} 选择器，如果提供，则得到元素前第一个符合条件的节点
		 * @return {Element} 新的元素集合
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
		 * @return {Element} 新的元素集合
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
		//add appendto prependto
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
			var parent = targetElement.parentNode;
			var offset = targetElement.nextSibling;
			var func = !!offset ? insertBefore : appendChild;
			for(var i = 0, il = elements.length; i < il; i++){
				func(parent, elements[i], offset);
			}
		},
		/**
		* 将元素从文档中分离
		* @method remove
		* @chainable
		*/
		remove: function(targetElement){
			if (targetElement.parentNode) 
				targetElement.parentNode.removeChild(targetElement);
		},
		/**
		* 删除节点
		* @method destroy
		* @chainable
		*/
		destroy: function(targetElement){
			if (targetElement.parentNode) 
				targetElement.parentNode.removeChild(targetElement);
			purgeChildren(targetElement);
		},
		/**
		 * 隐藏元素
		 * @method hide
		 * @chainable
		 */
		getshow:function(targetElement){
			return !(targetElement.style.display === 'none');
		},
		/**
		 * 显示元素
		 * @method show
		 * @chainable
		 */
		setshow:function(targetElement, value){
			if(value){
				var oldDisplay = Operation.getdata(targetElement, 'oldDisplay') || '';
				if(oldDisplay == 'none') oldDisplay = '';
				targetElement.style.display = oldDisplay;
			}else{
				var oldDisplay = targetElement.style.display;
				Operation.setdata(targetElement, 'oldDisplay', oldDisplay);
				targetElement.style.display = 'none';
			}
		},
		/*
		 * 监听一个事件
		 * @method on
		 * @param [delegate] {String} 监听的事件的代理的参数
		 * @param name {String} 事件名称
		 * @param callback {function} 事件的处理函数
		 * @param [options] {Object}  配置参数
				@option [options.scope] {Object} 指定处理函数的this，如果没有，则默认为element
				@option [options.data] {ANY} 绑定事件时附带的参数，事件处理时会附加在event.data中
				@option [options.delegate] {String} 代理事件，如果设置，只有符合该选择器的子元素才会触发事件，并且currentTarget指向被代理的元素
		 */
		on: KolaDomEvent.on,
		/**
		 * 取消对事件的监听
		 * @method off
		 * @param [delegate] {String} 监听的事件的代理的参数
		 * @param [name] {String} 监听的事件名称，如果没有，则取消所有类型事件的监听
		 * @param [callback] {Function} 事件处理方法 如果没有，则符合name的取消所有事件监听
		 * @param [options] {Object} 对解绑事件的描述
		 * @chainable
		 */
		off: KolaDomEvent.off,
		/**
		 * 触发事件
		 * @method fire
		 * @param name {String} 事件名称
		 * @param event {Object} 事件的参数
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
				return KolaArray.indexOf(new this.constructor(targetElement.parentNode).children(selector), targetElement);
			else
				return KolaArray.indexOf(targetElement.parentNode.children, targetElement);
		},
		pagePosition: function(targetElement, refer, set){
			if(refer){
				var refer = refer.getBoundingClientRect();
			}else{
				refer = {top: -document.body.scrollTop || -document.documentElement.scrollTop, left: -document.body.scrollLeft || -document.documentElement.scrollLeft}
			}
			var client = targetElement.getBoundingClientRect();
			if(set){
				Operation.setstyle(targetElement, "top", targetElement.offsetTop - client.top + refer.top + set.top);
				Operation.setstyle(targetElement, "left", targetElement.offsetLeft - client.left + refer.left + set.left);
			}else{
				return {top:client.top - refer.top, left:client.left - refer.left};
			}
		},
		clientPosition: function(targetElement, refer){
			if(!refer)
				return targetElement.getBoundingClientRect();
			var relativeToPage = Operation.pagePosition(targetElement, refer);
			relativeToPage.top -= refer.clientTop;
			relativeToPage.left -= refer.clientLeft;
			return relativeToPage;
		},
		toElements: toElements
	};
	/**
	 * kola的Element类
	 * 
	 * @class Element
	 * @constructor
	 * @param elements {Array<HTMLElement>}
	 */
	var exports = KolaClass.create({
		__ME:function(elements){
			//instanceof当涉及跨iframe时会工作不正常
			if(typeof elements === "string" && elements.charAt(0) != '<'){
				/*
					define DomRefer Array<HTMLElement>|NodeList|HtmlCollection|HtmlElement|Element|String
				*/
				/**
				* 使用选择器选择特定dom
				* @method Element
				* @param elements {String}
				* @return {Element}
				*/
				return new this(Selector(elements));
			}else{
				/**
				* 根据字符串生成dom，并生成Element
				* @method Element
				* @param elements {String} 要转换的字符串，以html < 格式开头
				* @return {Element}
				*/
				/**
				* 将指定的dom转换为Element
				* @method Element
				* @param elements {Array<HTMLElement>|NodeList|HtmlCollection|HtmlElement|Element}
				* @return {Element}
				*/
				return new this(Operation.toElements(elements));
			}
		},
		_init:function(elements){
			this.length = elements.length;
			for(var i = 0, il = this.length; i < il; i ++)
				this[i] = elements[i];
		},

		/**
		* 依次迭代内部dom，将内部每一个元素封装成Element交给callback处理
		* @method each
		* @param callback {Function} 回调函数
		* @chainable
		*/
		each: function (callback) {
			//	使用迭代器循环每个元素
			for(var i = 0, il = this.length; i < il; i++){
				if(callback.call(this, new this.constructor([this[i]]), i)===false)	return this;
			}
			return this;
		},

		/**
		 * 增加一些元素
		 * @method add
		 * @param elements {DomRefer} 要增加的dom集合
		 * @chainable
		 */
		add: function(elements){
			var elements = Operation.toElements(elements);
			for(var i = 0, il = elements.length; i < il ; i ++){
				this[this.length++] = elements[i];
			}
			unique(this);
			return this;
		},

		/**
		 * 移除一些元素
		 * @method not
		 * @param elements {DomRefer} 要移除的dom集合
		 * @chainable
		 */
		not: function(elements) {
			var elements = Operation.toElements(elements);
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
		 * 将符合选择器的元素组成一个新的element
		 * @method filter
		 * @param selector {String} 选择器
		 * @return {Element}
		 */
		filter: function(selector){
			var res = [];
			for(var i = 0, il = this.length; i<il; i++){
				if(Selector.matchesSelector(this[i], selector)){
					res.push(this[i]);
				}
			}
			return new this.constructor(res);
		},
		outer: function(value){
			if (arguments.length == 0) {
				return Operation.getouter(this[0])
			}else{
				for(var i = 0; i < this.length; i++){
					this[i] = Operation.setouter(this[i], value)[0]
				}
				return this;
			}
		},
		/**
		 * 将该元素添加到某个dom之后
		 * @method appendTo
		 * @param target {HtmlElement|Element} 被添加的元素
		 * @chainable
		 */
		appendTo: function(target){
			this.constructor(target).append(this);
			return this;
		},
		getData:function(){
			return Array.prototype.slice.call(this);
		},
		//使得浏览器认为实例是一个数组，方便调试
		splice:[].splice
	});
	exports._operations = Operation
	//定义一个针对节点读取属性或设置属性的操作
	function getSet(getFunction, setFunction){
		var functionGroup = [];
		getFunction.isGet = true;
		functionGroup[getFunction.length - 1] = getFunction;
		functionGroup[setFunction.length - 1] = setFunction;
		return functionGroup;
	}
	//getSet
	KolaArray.forEach('attr,prop,data,css,style,html,text,show,left,top,width,height'.split(','),function(functionName){
		var getSetFunction = getSet(Operation['get' + functionName], Operation['set' + functionName]);
		exports.prototype[functionName] = function(name, value){
			var operater = getSetFunction[arguments.length];
			if(operater.isGet){
				if(!this[0]) return null;
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
	KolaArray.forEach('clientPosition,pagePosition,index,is'.split(','),function(functionName){
		exports.prototype[functionName] = function(value, set){
			if(!this[0] || this[0].nodeType != 1)
				return;
			return Operation[functionName].call(this, this[0], value, set);
		}
	});
	//each
	KolaArray.forEach('fire,remove,destroy,append,prepend,before,after'.split(','),function(functionName){
		exports.prototype[functionName] = function(p0, p1){
			for(var i = 0; i < this.length; i++){
				Operation[functionName].call(this, this[i], p0, p1);
			}
			return this
		}
	});
	//on and off
	KolaArray.forEach('on,off'.split(','),function(functionName){
		exports.prototype[functionName] = function(delegate, name, callback, option){
			if(typeof name == "string"){
				option = option || {};
				option.delegate = delegate;
			}else{
				option = callback;
				callback = name;
				name = delegate;
			}
			for(var i = 0; i < this.length; i++){
				Operation[functionName].call(this, this[i], name, callback, option);
			}
			return this
		}
	});
	//traveller
	KolaArray.forEach('parent,parents,closest,children,find,down,prev,next'.split(','),function(functionName){
		exports.prototype[functionName] = function(p0, p1){
			var results = [];
			for(var i = 0; i < this.length; i++){
				var res = Operation[functionName].call(this, this[i], p0, p1);
				if(KolaArray.isArray(res))
					results = results.concat(res);
				else if(res)
					results.push(res);
			}
			return new this.constructor(unique(results));
		}
	});
	//shortcut for events
	KolaArray.forEach('click,mouseenter,mouseleave,mouseover,mouseout,mouseup,mousedown,mousemove,keyup,keydown,keypress,focus,blur,submit,change'.split(','),function(functionName){
		exports.prototype[functionName] = function(delegate, callback, option){
			if(typeof delegate == "string"){
				option = option || {};
				option.delegate = delegate;
			}else if(typeof delegate == 'function'){
				option = callback;
				callback = delegate
			}else{
				for(var i = 0; i < this.length; i++){
					KolaDomEvent.fire(this[i], functionName, delegate);
				}
				return this;
			}
			for(var i = 0; i < this.length; i++){
				KolaDomEvent.on(this[i], functionName, callback, option);
			}
			return this;
		}
	});
	/**
	 * 获取对象的位置的left，获取对象的位置，相对于其定位对象的位置(从自己的border外层开始，到定位对象的border内部结束)
	 * @method offsetLeft
	 * @return {Number}
	 */
	/**
	 * 获取对象的位置的top，获取对象的位置，相对于其定位对象的位置(从自己的border外层开始，到定位对象的border内部结束)
	 * @method offsetTop
	 * @return {Number}
	 */
	/**
	 * 获取对象的除margin外的站位宽(从border左上角开始，到border右下角结束)
	 * @method offsetWidth
	 * @return {Number}
	 */
	/**
	 * 获取对象的除margin外的站位高(从border左上角开始，到border右下角结束)
	 * @method offsetHeight
	 * @return {Number}
	 */
	/**
	 * 获取对象可视区域的位置的left，相对于该对象的位置(从自己的border外侧开始，到自己的border内侧结束)
	 * @method clientLeft
	 * @return {Number}
	 */
	/**
	 * 获取对象可视区域的位置的top，相对于该对象的位置(从自己的border外侧开始，到自己的border内侧结束)
	 * @method clientTop
	 * @return {Number}
	 */
	/**
	 * 获取对象的可视区域的宽(从border左上角内侧开始，到border右下角内侧结束)
	 * @method clientWidth
	 * @return {Number}
	 */
	/**
	 * 获取对象的可视区域的高(从border左上角内侧开始，到border右下角内侧结束)
	 * @method clientHeight
	 * @return {Number}
	 */
	/**
	 * 获取对象的内容区域的宽(从padding左上角外侧开始，到padding右下角外侧结束)
	 * @method scrollWidth
	 * @return {Number}
	 */
	/**
	 * 获取对象的内容区域的高(从padding左上角外侧开始，到padding右下角外侧结束)
	 * @method scrollHeight
	 * @return {Number}
	 */
	KolaArray.forEach('offsetLeft,offsetTop,offsetWidth,offsetHeight,clientLeft,clientTop,clientWidth,clientHeight,scrollWidth,scrollHeight'.split(','),function(functionName){
		exports.prototype[functionName] = function(){
			if(this.length>0){
				return this[0][functionName];
			}
		}
	});
	/**
	 * 获取对象的滚动条的位置的left
	 * @method scrollLeft
	 * @return {Number}
	 */
	/**
	 * 获取对象的滚动条的位置的left
	 * @method scrollLeft
	 * @param value
	 * @chainable
	 */
	/**
	 * 获取对象的滚动条的位置的top
	 * @method scrollTop
	 * @return {Number}
	 */
	/**
	 * 获取对象的滚动条的位置的top
	 * @method scrollLeft
	 * @param value
	 * @chainable
	 */
	KolaArray.forEach('scrollTop,scrollLeft'.split(','),function(functionName){
		exports.prototype[functionName] = function(value){
			if (arguments.length == 0) {
				if(this.length>0){
					return this[0][functionName];
				}
			}else{
				for(var i = 0; i < this.length; i++){
					this[i][functionName] == value;
				}
				return this;
			}
		}
	});
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
			domDispatcher.fire("DomCreate", arr);
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
	//将驼峰式转换为css写法
	function antihyphenate(name) {
		return name.replace(/-([a-z])/ig,function( all, letter ) {
			return letter.toUpperCase();
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
				nodes[data_name] = null;
			}
		};
		//如果会引起内存泄露，那就跟踪unload事件，处理这些
		KolaDomEvent.on(window, 'unload', function(){
			purgeChildren(document);
		});
	}else{
		var purgeChildren = KolaFunction.empty;
	}

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