
/**
 * @fileOverview kola.html.Element DOMElement对象类
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.html.Element', 
	['kola.lang.Array', 'kola.lang.Class', 'kola.lang.Function', 'kola.css.Selector', 'kola.bom.Event', 'kola.bom.Browser'],
	function(kolaArray, Class, Function, Selector, Event, Browser) {
	
	/********************************************** 替类定义 **********************************************/

	var CLASS = Class.create({

		/**
		 * 封装HTMLElement的对象
		 * @param {String|HTMLElement|kola.html.Element|Array<HTMLElement>} selector css选择器
		 * @param {HTMLElement|kola.html.Element|Array<HTMLElement>} context 选择范围
		 * @return 封装后的对象
		 */
		__ME: function(selector, context) {
			var st = typeof(selector);

			//	根据selector为不同的类型，进行不同的处理
			if (st == 'object') {
				//	如果为kola.html.Element
				if ( Class.isInstance( selector, 'kola.html.Element' ) ) return new this(selector.elements());
				//	如果为DOMLElement
				if (selector.nodeType === 1 || selector.nodeType === 9) return new this([selector]);

				//	如果为HTMLElement数组
				if (selector.length && selector.length > 0) return new this(selector);
			} else if (st == 'string') {
				//	如果为css selector
				var nodes;

				//	确认是否存在context
				switch (typeof(context)) {
					case 'undefined':
						//	没有context，可以直接返回
						context = null;
						break;
					case 'object':
						//	如果context为kola.html.Element
						if ( Class.isInstance( context, 'kola.html.Element' ) ) {
							context = context.elements();
							break;
						}

						//	如果context为一个HTMLElement
						if (context.nodeType === 1) {
							context = [context];
							break;
						}

						//	如果context不为HTMLElement数组，那就统一设置成null
						if (!context.length) {
							context = null;
						}
						break;
				}

				//	根据有无context进行不同的处理
				if (context === null) {
					nodes = Selector(selector);
				} else {
					//	context为数组，需要在每个context中寻找
					//	TODO: 这里是有问题的，因为如果selector就是获取第一个，或者指定的某个
					nodes = [];
					for (var i = 0, il = context.length; i < il; i ++) {
						nodes = nodes.concat(Selector(selector, context[i]));
					}
				}

				return nodes.length > 0 ? new this(nodes) : null;
			}

			return null;
		},

		/**
		 * 类初始化方法
		 * @param elements
		 */
		_init: function(elements) {
			this._elements = elements;
		},
	
		/*-------------------------------------- 基本属性相关 --------------------------------------*/
		
		/**
		 * 获取某个属性值
		 * @param {String} name 属性名
		 * @return 属性值
		 * @type String
		 */
		/**
		 * 设置某个属性值
		 * @param {String} name 属性名
		 * @param value 属性值
		 * @return 当前的Element对象
		 * @type Element
		 */
		attr: function(name, value) {
			if (typeof(value) == 'undefined') {
				//	现在是要获取属性值
				var element = this._elements[0];
				switch(name) {
					case 'class':
						return element.className;
					case 'style':
						return element.style.cssText;
					default:
						return attr(element, name);
				}
			} else {
				//	现在是要设置属性值
				kolaArray.forEach(this._elements, function(element) {
					switch(name) {
						case 'class':
							element.className = value;
							break;
						case 'style':
							element.style.cssText = value;
							break;
						default:
							//	如果是设置一个事件，而且是ie下的话，需要采用.on...的形式，setAttribute的形式是有问题的
							if (document.all && name.indexOf('on') == 0) {
								//	如果是字符串，需要转换成一个方法，ie下只能接受方法
								if (typeof(value) == 'string') {
									value = new Function(value);
								}
								element[name] = value;
							} else {
								element.setAttribute(name, value);
							}
					}
				});
				return this;
			}
		},

		/**
		 * 判断是否存在某个属性
		 */
		hasAttr: function( name ) {
			var element = this._elements[0];
			return element.hasAttribute ? element.hasAttribute( name ) : false;
		},
		
		/**
		 * 删除某个属性值
		 * @param {String} name 属性名
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		removeAttr: function(name) {
			kolaArray.forEach(this._elements, function(element) {
				element.removeAttribute(name);
			});
			return this;
		},
	
		/**
		 * 获取某个属性值
		 * @param {String} name 属性名
		 * @return 属性值
		 * @type String
		 */
		/**
		 * 设置某个属性值
		 * @param {String} name 属性名
		 * @param {ANY} value 属性值
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		prop: function(name, value) {
			if (typeof(value) == 'undefined') {
				//	获取属性值
				return this._elements[0][name];
			} else {
				//	设置属性值
				kolaArray.forEach(this._elements, function(element) {
					element[name] = value;
				});
				return this;
			}
		},
	
		/**
		 * 判断当前对象是否存在指定的样式
		 * @param {String} name 样式名儿
		 * @return 存在返回true，不存在返回false
		 * @type Boolean
		 */
		hasClass: function(name) {
			if ( typeof( name ) != 'string' || name.length == 0 ) {
				throw new Error( 'input signal out of range' );
			}
			var str = this._elements[0].className;
			return str.length > 0 && (' ' + str + ' ').indexOf(name) != -1;
		},
		
		/**
		 * 判断当前对象是否存在指定的样式
		 * @param {String} name 样式名儿
		 * @return 存在返回true，不存在返回false
		 * @type Boolean
		 */
		addClass: function(name) {
			if ( typeof( name ) != 'string' || name.length == 0 ) return this;
            var _this = this;
			kolaArray.forEach(this._elements, function(element) {
                if(!_this.constructor(element).hasClass(name)){
				    element.className += ' ' + name;
                }
			});
			return this;
		},
		
		/**
		 * 判断当前对象是否存在指定的样式
		 * @param {String} name 样式名儿
		 * @return 存在返回true，不存在返回false
		 * @type Boolean
		 */
		removeClass: function(name) {
			if ( typeof( name ) != 'string' || name.length == 0 ) return this;
			kolaArray.forEach(this._elements, function(element) {
				var str = element.className,
					index;

				if (str.length > 0 && (index = (str = (' ' + str + ' ')).indexOf(name)) != -1) {
					element.className = str.split(name).join(' ');
				}
			});
			return this;
		},
	
		/*-------------------------------------- 样式和位置相关 --------------------------------------*/
	
		/**
		 * 显示所有元素
		 */
		show: function(value) {
			if (typeof(value) == 'string') { 
				this.style('display', value);
			}else{
				this.style('display', '');
			}
			return this;
		},
		
		/**
		 * 隐藏所有元素
		 */
		hide: function() {
			return this.style('display', 'none');
		},
		
		/**
		 * 在显示和隐藏之间，切换元素的显示状态
		 */
		toggle: function(value) {
			kolaArray.forEach(this._elements, function(element) {
				var style = element.style;
				if (style.display == 'none') {
					style.display = typeof(value) == 'string' ? value : '';
				} else {
					style.display = 'none';
				}
			});
			return this;
		},
	
		/**
		 * 获取某个样式属性值
		 * @param {String} name 属性名
		 * @return 属性值
		 * @type String
		 */
		/**
		 * 设置某个样式属性值
		 * @param {String} name 属性名
		 * @param {ANY} value 属性值
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		style: function(name, value) {
			if (typeof(value) == 'undefined') {
				var element = this._elements[0],
					st = element.style;
				if (name == 'opacity') {
					var filter;
					if (typeof(filter = st.filter) == 'string' && filter.length>0) {
						return filter.indexOf("opacity=") >= 0 ? parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100 : 1;
					} else {
						return (filter = st.opacity) ? parseFloat(filter) : 1;
					}
				} else {
					return style( element, name );
				}
			} else {
				kolaArray.forEach(this._elements, function(element) {
					var st = element.style;
					if (name == 'opacity') {
						if (typeof(st.filter) == 'string' && st.filter.length>0) {
							st.filter = 'Alpha(Opacity=' + value*100 + ')'; 
						} else {
							st.opacity = (value == 1 ? '': '' + value);
						}
					} else {
						st[name] = value;
					}
				});
				return this;
			}
		},
		
		/**
		 * 删除某个样式值
		 * @param {String} name 属性名
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		removeStyle: function(name) {
			kolaArray.forEach(this._elements, function(element) {
				var s = element.style;
				if (s.removeProperty) {
					s.removeProperty(name);
				} else if (s.removeAttribute) {
					if (name == 'opacity' && typeof(element.style.filter) == 'string') {
						name = 'filter';
					}
					s.removeAttribute(name);
				} else {
					s[name] = null;
				}
			});
			return this;
		},
		
		/**
		 * 获取第一个对象的位置，相对于其定位对象的位置
		 * @return 位置
		 * @type Object
		 */
		/**
		 * 设置对象的位置，相对于其定位对象的位置
		 * @param {Object} position 新位置
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		pos: function(position) {
			if (typeof(position) == 'undefined') {
				//	获取位置值
				
				var element = this._elements[0];
				return {
					left: element.offsetLeft,
					top: element.offsetTop
				};
			} else {
				//	设置位置值
				
				kolaArray.forEach(this._elements, function(element) {
					if ( !isNaN( position.left ) ) element.style.left = position.left + 'px';
					if ( !isNaN( position.top ) ) element.style.top = position.top + 'px';
				});
				return this;
			}
		},
		
		/**
		 * 获取第一个对象的位置，相对于浏览器窗口区域的位置
		 * @return 位置
		 * @type Object
		 */
		/**
		 * 设置对象的位置，相对于浏览器窗口区域的位置
		 * @param {Object} position 新位置
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		clientPos: function(position) {
			if (typeof(position) == 'undefined') {
				//	获取位置值
				
				var pos = pagePos(this._elements[0]),
					db = document.body,
					de = document.documentElement;
				return {
					left: pos.left - Math.max(db.scrollLeft, de.scrollLeft),
					top: pos.top - Math.max(db.scrollTop, de.scrollTop)
				};
			} else {
				//	设置位置值
				
				//	FIXME: 这里应该是设置相对于浏览器窗口区域的，而不是现在的left和top值
				kolaArray.forEach(this._elements, function(element) {
					element.style.left = position.left + 'px';
					element.style.top = position.top + 'px';
				});
				return this;
			}
		},
		
		/**
		 * 获取第一个对象在页面上的绝对位置
		 * @return 位置
		 * @type Object
		 */
		/**
		 * 设置对象的绝对位置
		 * @param {Object} position 新位置
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		pagePos: function(position) {
			if (typeof(position) == 'undefined') {
				//	获取对象的绝对位置
				
				return pagePos(this._elements[0]);
			} else {
				//	设置对象的绝对位置
				
				//	FIXME: 这里应该是设置绝对位置，而不是现在的left和top值
				kolaArray.forEach(this._elements, function(element) {
					var pos = pagePos( element );
					//	如果设置了left值，那就计算left坐标
					if ( typeof position.left == 'number' ) {
						var left = style( element, 'left' );
						if ( !left ) {
							left = 0;
						} else {
							if ( typeof( left = parseFloat( left ) ) != 'number' ) {
								left = 0;
							}
						}
						element.style.left = ( position.left + left - pos.left) + 'px';
					}
					//	如果设置了top值，那就计算top坐标
					if ( typeof position.top == 'number' ) {
						var top = style( element, 'top' );
						if ( !top ) {
							top = 0;
						} else {
							if ( typeof( top = parseFloat( top ) ) != 'number' ) {
								top = 0;
							}
						}
						element.style.top = ( position.top + top - pos.top) + 'px';
					}
				});
				return this;
			}
		},
		
		/**
		 * 获取第一个对象的宽度
		 * @return 宽度
		 * @type Number
		 */
		/**
		 * 设置对象的宽度
		 * @param {Number} value 新宽度
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		width: function(value) {
			if (typeof(value) == 'undefined') {
				//	获取宽度
				
				return this._elements[0].offsetWidth;
			} else {
				//	设置宽度
				
				kolaArray.forEach(this._elements, function(element) {
					element.style.width = value + 'px';
				});
				return this;
			}
		},
		
		/**
		 * 获取第一个对象的高度
		 * @return 高度
		 * @type Number
		 */
		/**
		 * 设置对象的高度
		 * @param {Number} value 新高度
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		height: function(value) {
			if (typeof(value) == 'undefined') {
				//	获取宽度
				
				return this._elements[0].offsetHeight;
			} else {
				//	设置宽度
				
				kolaArray.forEach(this._elements, function(element) {
					element.style.height = value + 'px';
				});
				return this;
			}
		},

		/**
		 * 获取第一个对象客户区域的宽度
		 * @return 宽度
		 * @type Number
		 */
		clientWidth: function(value) {
			//	获取宽度
			return this._elements[0].clientWidth;
		},

		/**
		 * 获取第一个对象客户区域的高度
		 * @return 高度
		 * @type Number
		 */
		clientHeight: function() {
			//	获取宽度
			return this._elements[0].clientHeight;
		},

		/**
		 * 获取第一个对象滚动区域的宽度
		 * @return 宽度
		 * @type Number
		 */
		scrollWidth: function(value) {
			//	获取宽度
			return this._elements[0].scrollWidth;
		},

		/**
		 * 获取第一个对象滚动区域的高度
		 * @return 高度
		 * @type Number
		 */
		scrollHeight: function() {
			//	获取宽度
			return this._elements[0].scrollHeight;
		},
	
		/*-------------------------------------- 内容变更相关 --------------------------------------*/
		
		/**
		 * 获取节点中的html
		 * @return html字符串
		 * @type String
		 */
		/**
		 * 设置节点中的html
		 * @param {String} value 要设置的html字符串
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		html: function(value) {
			var el = this._elements[0],
				ret;

			//	如果是获取值，那就直接调用方法
			if ( typeof value == 'undefined' ) {
				return el.innerHTML;
			}

			//	这里是设置值
			if ( navigator.userAgent.indexOf('MSIE') != -1 ) {
				//	ie下直接调用替代方法
				ret = innerHtml(el, value);
			} else {

				//	首先调用原生方法，如果出错的话，那就调用替代方法
				try {
					ret = this.prop('innerHTML', value);
				} catch(e) {
					ret = innerHtml(el, value);
				}
			}

			//	派发dominsert事件
			if ( value != '' ) fireDomInsert( el );
			
			//	TODO: 这里是需要经过包装的，而且还需要考虑单个节点还是多个节点
			return ret;
		},
		
		/**
		 * 获取节点中的outerHTML
		 * @return html字符串
		 * @type String
		 */
		/**
		 * 设置节点中的outerHTML
		 * @param {String} value 要设置的html字符串
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		outer: function(value) {
			var el = this._element;
			if (typeof(value) == 'undefined') {
				return typeof(value = el.outerHTML) == 'string' ? value : document.createElement("div").appendChild(el.cloneNode(true)).parentNode.innerHTML;
			} else {
				//	移除事件监听，避免内存泄露
				clearChildsEvents( el, true );
				
				var parent = el.parentNode,
					news = [];
				
				var ele;
				if (el.outerHTML) {
					//	先缓存下前后和父节点，用于之后的获取
					var prev = el.previousSibling,
						next = el.nextSibling,
						parentNode = el.parentNode;
						
					//	设置outerHTML
					el.outerHTML = value;
					
					//	拿到新的节点
					if (prev) {
						//	存在初始节点的话，那就把初始节点的下个节点设置为开始
						ele = prev.nextSibling;
					} else {
						//	不存在初始节点，那就从第一个节点开始
						ele = parent.childNodes[0];
					}
					
					//	循环节点，只要不是最终或者结束节点，都是新添加的节点
					while (ele) {
						if (ele == next) break;
						if (ele.nodeType && ele.nodeType == 1) {
							news.push(ele);
						}
						ele = ele.nextSibling;
					}
				} else {
					var r = el.ownerDocument.createRange(),
						df = r.createContextualFragment(value),
						dfc = df.childNodes;
					for (var j=0, jl = dfc.length; j < jl; j++) {
						ele = dfc[j];
						if (ele.nodeType && ele.nodeType == 1) {
							news.push(ele);
						}
					}
					news.push(parent.replaceChild(df, el));
				}

				if ( news.length > 0 ) {
					//	派发dominsert事件
					fireDomInsert( news[ 0 ] );

					return new this.constructor(news);
				} else {
					return null;
				}
			}
		},
		
		/**
		 * 获取节点的text内容
		 * @return text内容
		 * @type String
		 */
		/**
		 * 设置节点中的text内容
		 * @param {String} value 要设置的text内容
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		text: function(value) {
			return this.prop(typeof(this._elements[0].innerText) != 'undefined' ? 'innerText' : 'textContent', value);
		},
		
		/**
		 * 在第一个元素的子节点的最后添加元素
		 * @return 被添加的节点
		 * @type kola.html.Element
		 */
		append: function() {
			var nodes = [];

			//	循环每个参数，依次把参数追加到第一个元素的子元素之后
			kolaArray.forEach(arguments, Function.bind((function(element, nodes, elementN) {
				var node;
				if (typeof(elementN) == 'string') {
					var ctr = document.createElement('div');
					ctr.innerHTML = elementN;
					while (ctr.firstChild) {
						node = appendChild(element, ctr.firstChild);
						if (node.nodeType == 1) {
							nodes.push(node);
						}
					}
				} else {
					if (elementN.nodeType) {
						elementN = [elementN];
					}
					for (var i = 0, il = elementN.length; i < il; i++) {
						node = appendChild(element, elementN[i]);
						if (node.nodeType == 1) {
							nodes.push(node);
						} else if ( node instanceof Array) {
							for ( var j = 0, jl = node.length; j < jl; j++ ) {
								nodes.push( node[j] );
							}
						}
					}
				}
			}), this, this._elements[0], nodes));

			if ( nodes.length > 0 ) {
				//	派发dominsert事件
				fireDomInsert( nodes[ 0 ] );

				return new this.constructor(nodes);
			} else {
				return null;
			}
		},
		
		/**
		 * 在第一个元素的子节点的最开始添加元素
		 * @return 被添加的节点
		 * @type kola.html.Element
		 */
		prepend: function() {
			var nodes = [],
				parent = this._elements[0],
				offset = parent.firstChild || null;
			kolaArray.forEach(arguments, Function.bind((function(parent, offset, nodes, elementN) {
				var node;
				if (typeof(elementN) == 'string') {
					var ctr = document.createElement('div');
					ctr.innerHTML = elementN;
					while (ctr.firstChild) {
						node = insertBefore(parent, ctr.firstChild, offset);
						if (!offset) offset = node;
						if (node.nodeType == 1) {
							nodes.push(node);
						}
					}
				} else {
					if (elementN.nodeType) {
						elementN = [elementN];
					}
					for (var i = 0, il = elementN.length; i < il; i ++) {
						node = insertBefore(parent, elementN[i], offset);
						if (!offset) offset = node;
						if (node.nodeType == 1) {
							nodes.push(node);
						}
					}
				}
			}), this, parent, offset, nodes));

			if ( nodes.length > 0 ) {
				//	派发dominsert事件
				fireDomInsert( nodes[ 0 ] );

				return new this.constructor(nodes);
			} else {
				return null;
			}
		},
		
		/**
		 * 在第一个元素之前添加元素
		 * @return 被添加的节点
		 * @type kola.html.Element
		 */
		before: function() {
			var nodes = [],
				offset = this._elements[0],
				parent = offset.parentNode;
			kolaArray.forEach(arguments, Function.bind((function(parent, offset, nodes, elementN) {
				var node;
				if (typeof(elementN) == 'string') {
					var ctr = document.createElement('div');
					ctr.innerHTML = elementN;
					while (ctr.firstChild) {
						node = insertBefore(parent, ctr.firstChild, offset);
						if (!offset) offset = node;
						if (node.nodeType == 1) {
							nodes.push(node);
						}
					}
				} else {
					if (elementN.nodeType) {
						elementN = [elementN];
					}
					for (var i = 0, il = elementN.length; i < il; i ++) {
						node = insertBefore(parent, elementN[i], offset);
						if (!offset) offset = node;
						if (node.nodeType == 1) {
							nodes.push(node);
						}
					}
				}
			}), this, parent, offset, nodes));

			if ( nodes.length > 0 ) {
				//	派发dominsert事件
				fireDomInsert( nodes[ 0 ] );

				return new this.constructor(nodes);
			} else {
				return null;
			}
		},
		
		/**
		 * 在第一个元素之后添加元素
		 * @return 被添加的节点
		 * @type kola.html.Element
		 */
		after: function() {
			var nodes = [],
				element = this._elements[0],
				parent = element.parentNode,
				offset = element.nextSibling,
				func = !!offset ? insertBefore : appendChild;
			kolaArray.forEach(arguments, Function.bind((function(parent, offset, func, nodes, elementN) {
				var node;
				if (typeof(elementN) == 'string') {
					var ctr = document.createElement('div');
					ctr.innerHTML = elementN;
					while (ctr.firstChild) {
						node = func(parent, ctr.firstChild, offset);
						if (node.nodeType == 1) {
							nodes.push(node);
						}
					}
				} else {
					if (elementN.nodeType) {
						elementN = [elementN];
					}
					for (var i = 0, il = elementN.length; i < il; i ++) {
						node = func(parent, elementN[i], offset);
						if (node.nodeType == 1) {
							nodes.push(node);
						}
					}
				}
			}), this, parent, offset, func, nodes));

			if ( nodes.length > 0 ) {
				//	派发dominsert事件
				fireDomInsert( nodes[ 0 ] );

				return new this.constructor(nodes);
			} else {
				return null;
			}
		},
	
		/*-------------------------------------- 元素获取相关 --------------------------------------*/
		
		/**
		 * 拿到每一个元素的前一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		prev: function() {
			var nodes = [], elements = this._elements;
			for (var i = 0, il = elements.length; i < il; i++) {
				var element = elements[i];
				while ( element = element.previousSibling ) {
					if ( element.nodeType == 1 ) {
						nodes.push( element );
						break;
					}
				}
			}

			return nodes.length > 0 ? new this.constructor(nodes) : null;
		},
		
		/**
		 * 拿到每一个元素的后一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		next: function() {
			var nodes = [], elements = this._elements;
			for (var i = 0, il = elements.length; i < il; i++) {
				var element = elements[i];
				while ( element = element.nextSibling ) {
					if ( element.nodeType == 1 ) {
						nodes.push( element );
						break;
					}
				}
			}

			return nodes.length > 0 ? new this.constructor(nodes) : null;
		},
		
		/**
		 * 拿到每一个元素的第一个子节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		first: function() {
			var nodes = [], elements = this._elements;
			for (var i = 0, il = elements.length; i < il; i++) {
				var childs = elements[i].childNodes,
					length = childs.length;
				for (var j = 0; j < length; j++) {
					var element = childs[j];
					if (!!element && element.nodeType == 1) {
						nodes.push(element);
						break;
					}
				}
			}

			return nodes.length > 0 ? new this.constructor(nodes) : null;
		},
		
		/**
		 * 拿到每一个元素的最后一个子节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		last: function(inAllType) {
			var nodes = [], elements = this._elements;
			for (var i = 0, il = elements.length; i < il; i++) {
				var childs = elements[i].childNodes,
					length = childs.length;
				for (var j = length - 1; j >= 0; j--) {
					var element = childs[j];
					if (!!element && element.nodeType == 1) {
						nodes.push(element);
						break;
					}
				}
			}
			return nodes.length > 0 ? new this.constructor(nodes) : null;
		},
		
		/**
		 * 拿到每一个元素的父节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		parent: function() {
			var nodes = [], elements = this._elements;
			for (var i = 0, il = elements.length; i < il; i++) {
				var element = elements[i].parentNode;
				if (!!element) {
					var isNew = true;
					for (var j = nodes.length - 1; j >= 0; j--) {
						if (nodes[j] == element) {
							isNew = false;
							break;
						}
					}
					if (isNew) nodes.push(element);
				}
			}

			return nodes.length > 0 ? new this.constructor(nodes) : null;
		},
		
		/**
		 * 拿到每一个元素的所有子节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		children: function() {
			var nodes = [], elements = this._elements;
			for (var i = 0, il = elements.length; i < il; i++) {
				var childs = elements[i].childNodes,
					length = childs.length;
				for (var j = 0; j < length; j++) {
					var element = childs[j];
					if (!!element && element.nodeType == 1) {
						nodes.push(element);
					}
				}
			}

			return nodes.length > 0 ? new this.constructor(nodes) : null;
		},
		
		/**
		 * 找到所有元素上面所有符合指定selector的元素
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		up: function(selector) {
			var nodes = [], elements = this._elements;
			for (var i = 0, il = elements.length; i < il; i++) {
				var element = elements[i];
				while ((element = element.parentNode) && (element.nodeType == 1)) {
					nodes.push(element);
				}
			}
			nodes = Selector.matches(selector, nodes);

			return nodes.length > 0 ? new this.constructor(nodes) : null;
		},
		
		/**
		 * 找到所有元素上面所有符合指定selector的元素（包括当前元素）
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		upWithMe: function(selector) {
			var nodes = [], elements = this._elements;
			for (var i = 0, il = elements.length; i < il; i++) {
				var element = elements[i];
				if (element.nodeType == 1) {
					nodes.push(element);
				} else {
					break;
				}
				while ((element = element.parentNode) && (element.nodeType == 1)) {
					nodes.push(element);
				}
			}
			nodes = Selector.matches(selector, nodes);

			return nodes.length > 0 ? new this.constructor(nodes) : null;
		},
		
		/**
		 * 找到所有元素上面所有符合指定selector的元素
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		down: function(selector) {
			var nodes = [], elements = this._elements;
			for (var i = 0, il = elements.length; i < il; i++) {
				var element = elements[i];
				//	TODO: 这里是有问题的，因为如果selector就是获取第一个，或者指定的某个
				nodes = nodes.concat(Selector(selector, element));
			}

			return nodes.length > 0 ? new this.constructor(nodes) : null;

		},
		
		/**
		 * 找到所有元素上面所有符合指定selector的元素（包括当前元素）
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		downWithMe: function(selector) {
			var nodes = [], elements = this._elements;
			for (var i = 0, il = elements.length; i < il; i++) {
				var element = elements[i];

				//	TODO: 这里是有问题的，因为如果selector就是获取第一个，或者指定的某个
				if (element.nodeType == 1) {
					nodes = nodes.concat(Selector.matches(selector, [element]));
				}
				nodes = nodes.concat(Selector(selector, element));
			}

			return nodes.length > 0 ? new this.constructor(nodes) : null;
		},

		/**
		 * 获取指定的HTMLElement
		 * @param {Number} index 获取的HTMLElement的位置，如果没有设置index，那就是返回元素数组
		 * @return 获得的HTMLElement
		 * @type HTMLElement|Array<HTMLElement>
		 */
		elements: function(index) {
			var elements = this._elements;
			if (typeof(index) == 'number') {
				if (index < 0) {
					return elements[elements.length + index];
				} else {
					return elements[index];
				}
			} else {
				return elements;
			}
		},
		
		/*
		 * 删除自身元素
		 */
		remove: function() {
			kolaArray.forEach(this._elements, function(element) {
				if (element.parentNode) 
					element.parentNode.removeChild(element);
			});
		},

		/*-------------------------------------- 数组相关 --------------------------------------*/

		/**
		 * 获取原生对象的数量
		 */
		size: function() {
			return this._elements.length;
		},

		/**
		 * 获取查获的元素数量
		 */
		each: function( fn ) {

			var elements = this._elements;

			//	使用迭代器循环每个元素
			for ( var i = 0, il = elements.length; i < il; i++ ) {
				fn( this.constructor( elements[i] ), i );
			}

			return this;
		},
	
		/*-------------------------------------- 事件相关 --------------------------------------*/
	
		/**
		 * 监听事件
		 * @param {String} name 监听的事件名称
		 * @param {Function} listenerfn 事件处理方法
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		on: function(name, listenerfn) {
			kolaArray.forEach(this._elements, function(element) {
				Event.on(element, name, listenerfn);
			});
			return this;
		},
		
		/**
		 * 取消对事件的监听
		 * @param {String} name 监听的事件名称
		 * @param {Function} listenerfn 事件处理方法
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		un: function(name, listenerfn) {
			kolaArray.forEach(this._elements, function(element) {
				Event.un(element, name, listenerfn);
			});
			return this;
		},
	
		/**
		 * 监听发生在元素外部的事件
		 * @param {String} name 监听的事件名称
		 * @param {Function} listenerfn 事件处理方法
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		onout: function(name, listenerfn) {
			kolaArray.forEach(this._elements, function(element) {
				Event.onout(element, name, listenerfn);
			});
			return this;
		},
	
		/**
		 * 取消对发生在元素外部的事件的监听
		 * @param {String} name 监听的事件名称
		 * @param {Function} listenerfn 事件处理方法
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		unout: function(name, listenerfn) {
			kolaArray.forEach(this._elements, function(element) {
				Event.unout(element, name, listenerfn);
			});
			return this;
		},

		/**
		 * 判断是否包含指定的对象
		 * @param {KolaElement} element 对象
		 * @return true 或者 false
		 * @type boolean
		 */
		contains: function(element) {
			if (!element || !(element = this.constructor(element))) return false;
			element = element._elements[0];
			var el = this._elements[0];
			
			if (el.contains) {
				return el.contains(element);
			} else {
				while (element = element.parentNode) {
					if (element == el) return true;
				}
				return false;
			}
		},

		/**
		 * 监听单击事件
		 * @param listenerfn
		 */
		click: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.on(element, 'click', listenerfn);
			});
			return this;
		},

		/**
		 * 取消监听单击事件
		 * @param listenerfn
		 */
		unclick: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.un(element, 'click', listenerfn);
			});
			return this;
		},

		/**
		 * 监听mouseover事件
		 * @param listenerfn
		 */
		mouseover: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.on(element, 'mouseover', listenerfn);
			});
			return this;
		},

		/**
		 * 取消监听mouseover事件
		 * @param listenerfn
		 */
		unmouseover: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.un(element, 'mouseover', listenerfn);
			});
			return this;
		},

		/**
		 * 监听mouseout事件
		 * @param listenerfn
		 */
		mouseout: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.on(element, 'mouseout', listenerfn);
			});
			return this;
		},

		/**
		 * 取消监听mouseout事件
		 * @param listenerfn
		 */
		unmouseout: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.un(element, 'mouseout', listenerfn);
			});
			return this;
		},

		/**
		 * 监听keyup事件
		 * @param listenerfn
		 */
		keyup: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.on(element, 'keyup', listenerfn);
			});
			return this;
		},

		/**
		 * 取消监听keyup事件
		 * @param listenerfn
		 */
		unkeyup: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.un(element, 'keyup', listenerfn);
			});
			return this;
		},

		/**
		 * 监听keydown事件
		 * @param listenerfn
		 */
		keydown: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.on(element, 'keydown', listenerfn);
			});
			return this;
		},

		/**
		 * 取消监听keydown事件
		 * @param listenerfn
		 */
		unkeydown: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.un(element, 'keydown', listenerfn);
			});
			return this;
		},

		/**
		 * 监听keypress事件
		 * @param listenerfn
		 */
		keypress: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.on(element, 'keypress', listenerfn);
			});
			return this;
		},

		/**
		 * 取消监听keypress事件
		 * @param listenerfn
		 */
		unkeypress: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.un(element, 'keypress', listenerfn);
			});
			return this;
		}
	});
	
	/********************************************** 私有方法 **********************************************/

	/**
	 * 获取一个对象的某个attribute，主要是为了解决IE下在form节点上获取attribute不对的问题
	 */
	var attr = function(element, name) {
	
		var value = element.getAttribute(name);
		
		//todo:对表单元素属性的封装
		if(value==null)
			value=element[name];
		if (document.all && typeof(value) == 'object' && value != null) {
			value = element.attributes.getNamedItem(name);
			return !!value ? value.value : null;
		}
		return value;
	};
	
	/**
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

	/**
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
	
	/**
	 * 可以获取没有设置属性的默认值，比如没有设置opacity，此时css('opactiry')  = 1, 还可以支持auto
	 */
	var hyphenate = function(name) {
		return name.replace(/[A-Z]/g, function(match) {
			return '-' + match.toLowerCase();
		});
	};

	var isBody = function(tag) {
		var reg = /^body|html$/i;
		isBody = function(tag) {
			return !reg.test(tag);
		};
		isBody(tag);
	};
	
	var pagePos = function(element) {
		var left = 0,
			top = 0,
			doc = document,
			de = doc.documentElement,
			db = doc.body,
			add = function(l, t) {
				left += l || 0;
				top += t || 0;
			};
		
		if (element.getBoundingClientRect) {
			//	存在方法直接获取位置，那就直接获取之
			
			var box = element.getBoundingClientRect();
			add(box.left + Math.max(de.scrollLeft, db.scrollLeft) - de.clientLeft,
					box.top + Math.max(de.scrollTop, db.scrollTop) - de.clientTop);
		} else {
			//	只能进行位置累加获取
			
			var op = element.offsetParent,
				parent = element.parentNode;
				
			add(element.offsetLeft, element.offsetTop);
			
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
		return {left: left, top: top, x: left, y: top};
	};

	/**
	 * 获取样式属性
	 * @param element
	 * @param name
	 */
	var style = function( element, name ) {
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
	};

	/**
	 * 设置对象的innerHTML，主要针对不直接支持innerHTML的对象
	 * @param el
	 * @param value
	 */
	var innerHtml = function(el, value) {
		//	先解除旗下所有节点的事件，避免内存泄露
		clearChildsEvents( el );
		
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
			if ( tagName == 'select' && Browser.render() == 'ie' && Browser.renderVersion() < 10 ) {
				el.selectedIndex = 0;
			}
		} else {
			el.innerHTML = value;
		}

		return el.childNodes;
	};

	/**
	 * 在document上派发 dominsert事件
	 * @param elements
	 */
	var fireDomInsert = function( element ) {
		setTimeout( function() {
			Event.fire( document, 'DOMNodeInsertedIntoDocument', {
				target: element,
				currentTarget: document
			});
		}, 0 );
	};

	/* ---------------------- 跟踪页面销毁事件，用于避免内存泄露 ---------------------*/
	
	/**
	 * 移除某个节点的所有事件，并循环调用所有子节点，依次调用之
	 */
	var clearEvent = function( node, notThis ) {
		
		//	如果本对象存在事件
		if ( !notThis ) {
			Event.un( node );
		}
		
		//	获得所有子节点，依次判断之
		var nodes = node.children,
			count;
		if ( nodes && ( count = nodes.length ) > 0 ) {
			for ( var i = count - 1; i >= 0; i-- ) {
				clearEvent( nodes[ i ] );
			}
		}
	};
	
	/**
	 * 移除某个节点所有子孙节点的事件监听
	 */
	var clearChildsEvents = function( element, includeThis ) {
		//	非IE或者是IE8及其以上版本，才需要移除所有事件
		if ( !window.ActiveXObject || window.XDomainRequest ) {
			clearChildsEvents = Function.empty;
			return;
		}
		
		if ( includeThis ) {
			Event.un( element );
		}
		
		//	如果支持document.all属性
		var nodes = element.all,
			count;
		if ( nodes && ( count = nodes.length ) > 0 ) {
			for ( var i = count - 1; i >= 0; i-- ) {
				Event.un( nodes[ i ] );
			}
		} else {
			clearEvent( element, true );
		}
	};

	/********************************************** 插件配置 **********************************************/

	CLASS.__PLUGIN_CONFIG = {
		type: 'Class'
	};
	
	/********************************************** 返回类 **********************************************/
	
	return CLASS;
	
});