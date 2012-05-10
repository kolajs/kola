kola('kola.html.Content', 
	['kola.html.ElementCore','kola.lang.Array','kola.lang.Function','kola.bom.Browser','kola.bom.Event'],
function(KElement,A,F,Browser,KEvent){
    var Content={
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
            if(this.length==0)
                return "";
			var el = this[0],
				ret;

			//	如果是获取值，那就直接调用方法
			if ( typeof value == 'undefined' ) {
				return el.innerHTML;
			}

			//	这里是设置值
			if (Browser.IE) {
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
            KElement.fire({type:"DOMNodeInserted",data:this[0].childNodes});
			
			//	TODO: 这里是需要经过包装的，而且还需要考虑单个节点还是多个节点
			return this;
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
			//	TODO: 这部分的代码需要重写
			var el = this[0];
            if(this.length==0)
                return "";
			//	如果是获取值，那就直接调用方法
			if ( typeof value == 'undefined' ) {
				return el.outerHTML;
			} else {
                this.before(value);
                this.remove();
				return this;
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
            if(!this.length)
                return "";
			return this.prop(typeof(this[0].innerText) != 'undefined' ? 'innerText' : 'textContent', value);
		},
		
		/**
		 * 在第一个元素的子节点的最后添加元素
		 * @return 被添加的节点
		 * @type kola.html.Element
		 */
		append: function(target) {
            var elements=KElement.util.toElements(target);
            var el=this[0];
            for(var i=0,il=elements.length;i<il;i++){
                appendChild(el, elements[i]);
            }
            return this;
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
		prepend: function(target) {
            var elements=KElement.util.toElements(target);
            var el=this[0];
            var offset = el.firstChild || null;
            for(var i=elements.length-1;i>=0;i--){
                insertBefore(el, elements[i],offset);
            }
            return this;
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
			A.forEach(arguments, F.bind((function(parent, offset, nodes, elementN) {
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
            KElement.fire({type:"DOMNodeInserted",data:nodes});
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
			A.forEach(arguments, F.bind((function(parent, offset, func, nodes, elementN) {
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
            KElement.fire({type:"DOMNodeInserted",data:nodes});
			return new this.constructor(nodes);
		},
	
		/**
		 * 删除自身元素
         * @warn ie6,7下可能会造成内存泄露 
		 */
		remove: function() {
			this._each( function(element) {
				if (element.parentNode) 
					element.parentNode.removeChild(element);
			});
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
			if(el==element)
                return true;
			if (el.contains) {
				return el.contains(element);
			} else {
				while (element = element.parentNode) {
					if (element == el) return true;
				}
				return false;
			}
		}
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
	
	var isBody = function(tag) {
		var reg = /^body|html$/i;
		isBody = function(tag) {
			return !reg.test(tag);
		};
		isBody(tag);
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
    
	/**
	 * 移除某个节点所有子孙节点对js的引用，避免内存泄露
	 */
    if(!window.ActiveXObject || window.XDomainRequest){//IE6,7需要移除所有事件
        var purgeChildren = F.empty;
    }else{
        var purgeChildren = function( element ) {
            var nodes = element.all,count;
            for ( var i = nodes.length - 1; i >= 0; i-- ) {
                KEvent.off( nodes[ i ] );
                node[ElementCore.expando]=null;
            }
        };
        /**
         * 如果会引起内存泄露，那就跟踪unload事件，处理这些
         */

        KEvent.on( window, 'unload', function() {
            purgeChildren(document);
        });
    }
    return Content;
});