kola('kola.html.Properties', 
	['kola.html.ElementCore','kola.bom.Browser'],
function(KElement,Browser){
    var Properties={
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
           @warning 在ie67下设置可能会导致内存泄露
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
		 * 删除某个属性值
		 * @param {String} name 属性名
		 * @type String
		 */
		removeProp: function(name) {
            this._each( function(element) {
                element[name] = null;
            });
            return this;
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
                if(element.className.indexOf(name)==-1){
				    element.className += ' ' + name;
                }
			});
			return this;
		},
		/**
		 * 移除指定样式
		 * @param {String} name 样式名儿
		 * @return 存在返回true，不存在返回false
		 * @type Boolean
		 */
		removeClass: function(name) {
			if ( typeof( name ) != 'string' || name.length == 0 ) return this;
			this._each( function(element) {
				var str = element.className,index;
				if (str.length > 0 && (index = (str = (' ' + str + ' ')).indexOf(name)) != -1) {
					element.className = str.split(name).join(' ');
				}
			});
			return this;
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
					if (Browser.IEStyle) {
						return filter.indexOf("opacity=") >= 0 ? parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100 : 1;
					} else {
						return (filter = st.opacity) ? parseFloat(filter) : 1;
					}
				} else {
					return KElement.util.getComputedStyle( element, name );
				}
			} else {
				this._each(function(element) {
					var st = element.style;
					if (name == 'opacity') {
						if (Browser.IEStyle) {
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
		}
    }
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
    return Properties;
});