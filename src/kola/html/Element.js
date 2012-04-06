
/**
 * @fileOverview kola.html.Element DOMElement对象类
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.html.Element', 
	[':Array',':Class',':Function',':Type',':Selector',':Event',':Browser',':Dispatcher'],
function(kolaArray, C, F,Type, Selector, Event, Browser,Dispatcher) {
	
	/********************************************** 替类定义 **********************************************/
    var noPx={
		"zIndex": true,
		"fontWeight": true,
		"opacity": true,
		"zoom": true,
		"lineHeight": true
	};
    /**
        用于element.data的存储
    */
    var cache={};
    var cache_attr_name="data-E2F32B1"
    var cacheSize=0;
	var CLASS = C.create(Dispatcher,{

		/**
		 * 封装HTMLElement的对象
		 * @param {String|HTMLElement|kola.html.Element|Array<HTMLElement>} selector css选择器
		 * @param {HTMLElement|kola.html.Element|Array<HTMLElement>} context 选择范围
		 * @return 封装后的对象
		 */
		__ME: function(selector, context) {
			if(Type.isString(selector) && selector.charAt(0)!='<'){
                //	如果为css selector
				var nodes;

				//	确认是否存在context
                if(Type.isUndefined(context)){
                    context=null;
                }else{
                    context=toElements(context);
                    if(context.length==0)
                        context=null;
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
				return new this(nodes);
            }else{
                var nodes=toElements(selector);
            }
            if(nodes)
                return new this(nodes);
			return null;
		},

		/**
		 * 类初始化方法
		 * @param elements
		 */
		_init: function(elements) {
            this.length=elements.length;
            for(var i=0;i<this.length;i++)
                this[i]=elements[i];
			this._elements = elements;
		},
        /**
        简单each
        */
        _each:function(callBack){
            for(var i=0,il=this.length;i<il;i++)
                callBack.call(this,this[i]);
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
				var element = this[0];
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
				this._each( function(element) {
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
			var element = this[0];
			return element.hasAttribute ? element.hasAttribute( name ) : false;
		},
		
		/**
		 * 删除某个属性值
		 * @param {String} name 属性名
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		removeAttr: function(name) {
			this._each( function(element) {
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
				return this[0][name];
			} else {
				//	设置属性值
				this._each( function(element) {
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
			var str = this[0].className;
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
			this._each( function(element) {
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
			this._each( function(element) {
				var str = element.className,
					index;

				if (str.length > 0 && (index = (str = (' ' + str + ' ')).indexOf(name)) != -1) {
					element.className = str.split(name).join(' ');
				}
			});
			return this;
		},
        /**
            得到第0个元素的data[name]
            或者设置所有元素的data[name]
        */
        data:function(name,data){
            if(Type.isUndefined(data)){
                index=this.attr(cache_attr_name);
                if(!index || !cache[index])
                    return null;
                return cache[index][name];
            }else{
                this.each(function(e){
                    index=this.attr(cache_attr_name);
                    if(!index){
                        index=cacheSize++;
                        this.attr(cache_attr_name,index);
                    }
                    if(!cache[index])
                        cache[index]={};
                    cache[index][name]=data;
                })
            }
        },
        /**
            移除所有元素的data[name]
        */
        removeData:function(name){
            this.each(function(e){
                index=this.attr(cache_attr_name);
                if(!index || !cache[index])
                    return;
                cache[index][name]=null;
            });
        },
        /**
            移除所有元素的所有data
        */
        removeAllData:function(){
            this.each(function(e){
                index=this.attr(cache_attr_name);
                if(!index)
                    return;
                cache[index]=null;
            });
        },
		/*-------------------------------------- 样式和位置相关 --------------------------------------*/
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
            //将名称转为驼峰式
            name=name.replace(/-([a-z])/ig,function( all, letter ) {return letter.toUpperCase();});
			if (typeof(value) == 'undefined') {
				var element = this[0],
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
				this._each(function(element) {
					var st = element.style;
					if (name == 'opacity') {
						if (Browser.isIE) {
							st.filter = 'Alpha(Opacity=' + value*100 + ')'; 
						} else {
							st.opacity = (value == 1 ? '': '' + value);
						}
					} else {
                        //如果是数字，自动加px
                        var newValue=parseInt(value);
                        if(newValue==value && !noPx[name])
                            value=value+"px";
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
			this._each( function(element) {
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
				
				var element = this[0];
				return {
					left: element.offsetLeft,
					top: element.offsetTop
				};
			} else {
				//	设置位置值
				
				this._each( function(element) {
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
				
				var pos = pagePos(this[0]),
					db = document.body,
					de = document.documentElement;
				return {
					left: pos.left - Math.max(db.scrollLeft, de.scrollLeft),
					top: pos.top - Math.max(db.scrollTop, de.scrollTop)
				};
			} else {
				//	设置位置值
				
				//	FIXME: 这里应该是设置相对于浏览器窗口区域的，而不是现在的left和top值
				this._each( function(element) {
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
				
				return pagePos(this[0]);
			} else {
				//	设置对象的绝对位置
				
				//	FIXME: 这里应该是设置绝对位置，而不是现在的left和top值
				this._each( function(element) {
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
				
				return this[0].offsetWidth;
			} else {
				//	设置宽度
				
				this._each( function(element) {
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
				
				return this[0].offsetHeight;
			} else {
				//	设置宽度
				
				this._each( function(element) {
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
			return this[0].clientWidth;
		},

		/**
		 * 获取第一个对象客户区域的高度
		 * @return 高度
		 * @type Number
		 */
		clientHeight: function() {
			//	获取宽度
			return this[0].clientHeight;
		},

		/**
		 * 获取第一个对象滚动区域的宽度
		 * @return 宽度
		 * @type Number
		 */
		scrollWidth: function(value) {
			//	获取宽度
			return this[0].scrollWidth;
		},

		/**
		 * 获取第一个对象滚动区域的高度
		 * @return 高度
		 * @type Number
		 */
		scrollHeight: function() {
			//	获取宽度
			return this[0].scrollHeight;
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
			var el = this[0],
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

			
			//	TODO: 这里是需要经过包装的，而且还需要考虑单个节点还是多个节点
			return ret;
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
			return this.prop(typeof(this[0].innerText) != 'undefined' ? 'innerText' : 'textContent', value);
		},
		
		/**
		 * 在第一个元素的子节点的最后添加元素
		 * @return 被添加的节点
		 * @type kola.html.Element
		 */
		append: function(target) {
            var elements=toElements(target);
            var el=this[0];
            for(var i=0,il=elements.length;i<il;i++){
                appendChild(el, elements[i]);
            }
            //给数组中的每一项都添加内容，暂时用不到
            /*
            for(var i=1;il<this.length;i++){
                var el=this[i];
                for(var i=0,il=elements.length;i<il;i++){
                    appendChild(el, elements[i].cloneNode(true));
                }
            }
            */
		},
		
		/**
		 * 在第一个元素的子节点的最开始添加元素
		 * @return 被添加的节点
		 * @type kola.html.Element
		 */
		prepend: function() {
			var nodes = [],
				parent = this[0],
				offset = parent.firstChild || null;
			kolaArray.forEach(arguments, F.bind((function(parent, offset, nodes, elementN) {
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
				offset = this[0],
				parent = offset.parentNode;
			kolaArray.forEach(arguments, F.bind((function(parent, offset, nodes, elementN) {
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

			return new this.constructor(nodes);
		},
		
		/**
		 * 在第一个元素之后添加元素
		 * @return 被添加的节点
		 * @type kola.html.Element
		 */
		after: function() {
			var nodes = [],
				element = this[0],
				parent = element.parentNode,
				offset = element.nextSibling,
				func = !!offset ? insertBefore : appendChild;
			kolaArray.forEach(arguments, F.bind((function(parent, offset, func, nodes, elementN) {
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

			return new this.constructor(nodes);
		},
	
		/*-------------------------------------- 元素获取相关 --------------------------------------*/
		
		/**
		 * 拿到每一个元素的前一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		prev: function() {
			var nodes = [];
			for (var i = 0, il = this.length; i < il; i++) {
				var element = this[i];
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
			var nodes = [];
			for (var i = 0, il = this.length; i < il; i++) {
				var element = this[i];
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
			var nodes = [];
			for (var i = 0, il = this.length; i < il; i++) {
				var childs = this[i].childNodes,
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
		last: function() {
			var nodes = [];
			for (var i = 0, il = this.length; i < il; i++) {
				var childs = this[i].childNodes,
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
			var nodes = [];
			for (var i = 0, il = this.length; i < il; i++) {
				var element = this[i].parentNode;
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
			var nodes = [];
			for (var i = 0, il = this.length; i < il; i++) {
				var childs = this[i].childNodes,
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
			var nodes = [];
			for (var i = 0, il = this.length; i < il; i++) {
				var element = this[i];
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
		closest: function(selector) {
			var nodes = [];
			for (var i = 0, il = this.length; i < il; i++) {
				var element = this[i];
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
		 * 获取指定的HTMLElement
		 * @param {Number} index 获取的HTMLElement的位置，如果没有设置index，那就是返回元素数组
		 * @return 获得的HTMLElement
		 * @type HTMLElement|Array<HTMLElement>
		 */
		elements: function(index) {
			if (typeof(index) == 'number') {
				if (index < 0) {
					return this[elements.length + index];
				} else {
					return this[index];
				}
			} else {
				return this._elements;
			}
		},
		
		/*
		 * 删除自身元素
		 */
		remove: function() {
			this._each( function(element) {
				if (element.parentNode) 
					element.parentNode.removeChild(element);
			});
		},

		/*-------------------------------------- 数组相关 --------------------------------------*/

		/**
		 * 获取原生对象的数量
		 */
		size: function() {
			return this.length;
		},

		/**
		 * 获取查获的元素数量
		 */
		each: function( fn ) {
			//	使用迭代器循环每个元素
			for ( var i = 0, il = this.length; i < il; i++ ) {
				fn.call( this.constructor( this[i] ), i );
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
			this._each( function(element) {
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
			this._each( function(element) {
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
			this._each( function(element) {
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
			this._each( function(element) {
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
			element = element[0];
			var el = this[0];
			
			if (el.contains) {
				return el.contains(element);
			} else {
				while (element = element.parentNode) {
					if (element == el) return true;
				}
				return false;
			}
		},
        //使得浏览器认为实例是一个数组，方便调试
        length:0,
        splice:[].splice
	});
    /*******dom遍历********/
    var traveler={
        /**
            得到符合selector的子元素
        */
        children:function(element,selector){
            return Selector(selector,element.children)
        },
        /**
            得到子树上符合selector的元素
        */
        find:function(element,selector){
            return Selector(selector,element).concat(Selector(selector,[element]));
        }
    }
    for(var key in traveler){
        CLASS.prototype[key]=function(selector){
            var nodes=[];
            var _this=this;
            this._each( function(element) {
                nodes=nodes.concat(traveler[key].call(_this,element,selector));
			});
            return new CLASS(kolaArray.unique(nodes));
        }
    }
	//shortcut
    kolaArray.forEach('click,mouseover,mouseout,mouseup,mousedown,keyup,keydown,keypress'.split(','),function(name){
        CLASS.prototype[name]=function(listenerfn){
            this._each( function(element) {
				Event.on(element,name, listenerfn);
			});
        }
    });
	/********************************************** 私有方法 **********************************************/
    /**
    得到元素数组
        Array[element] :不变
        element：[element]
        kolaElement:kolaElement的_elements
        String(html):转换成element
    */
    function toElements(selector,context){
        if(Type.isArray(selector)){
            return selector;
        }
        if(Type.isString(selector)){
            //	如果为html
            var ctr = document.createElement('div');
            ctr.innerHTML = selector;
            var arr=[];
            for(var i=ctr.children.length-1;i>=0;i--){
                arr[i]=ctr.children[i];
            }
            CLASS.dispatch({type:"ElementCreate",data:arr});
            return arr;
        }
        //	如果为kola.html.Element
        if ( selector instanceof CLASS )
            return selector.elements();
        //	如果为DOMLElement
        if (selector.nodeType === 1 || selector.nodeType === 9) 
            return [selector];
    }
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
			clearChildsEvents = F.empty;
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
	//debug only
    window.K=CLASS
	return CLASS;
	
});