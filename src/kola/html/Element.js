/**
 * kola html Element 包，提供dom元素的封装
 * 
 * @module kola.html
 */

kola('kola.html.Element',[
	'kola.lang.Class',
	'kola.lang.Array',
	'kola.html.util.Selector',
	'kola.html.util.Event',
	'kola.html.util.Operation'
],function(KolaClass, KolaArray, Selector, KolaBomEvent, Operation){
	/**
	 * kola的KolaElement类
	 * 
	 * @class KolaElement
	 * 
	 */
	var exports = KolaClass({
		__ME: function(selector){
			//instanceof当涉及跨iframe时会工作不正常
			if(typeof selector === "string" && selector.charAt(0) != '<'){
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
				return new this(Operation.toElements(selector));
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
			/**
			* 查询一个元素的html(包含元素自身)
			* @method outerHtml
			* @return {String}
			*/
			if(arguments.length == 0){
				return this[0].outerHTML;
			}
			/**
			* 设置一个元素的html(包含元素自身)
			* @method outerHtml
			* @param value {String} 要设置的html
			* @chainable
			*/
			for(var i = this.length - 1; i>=0 ; i--){
				targetElement = this[i]
				var newElements = toElements(value)
				Operation.before(this[i], newElements);
				Operation.detach(this[i]);
				this[i] = newElements[0];
			}
			return this;
		},
		//使得浏览器认为实例是一个数组，方便调试
		splice:[].splice
	});
	//定义一个针对节点读取属性或设置属性的操作
	function getSet(get, set){
		var lengthGroup = [];
		get.isGet = true;
		lengthGroup[get.length - 1] = get;
		lengthGroup[set.length - 1] = set;
		return lengthGroup;
	}
	//getSet
	KolaArray.forEach('attr,prop,data,css,style,val,html,text'.split(','),function(functionName){
		var getSetFunction = getSet(Operation['get' + functionName], Operation['set' + functionName][1]);
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
	KolaArray.forEach('on,fire,off,mouseleave,mouseenter,detach,append,prepend,before,after'.split(','),function(functionName){
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
				if(KolaClass.isArray(res))
					results = results.concat(res);
				else if(res)
					results.push(res);
			}
			return new exports(unique(results));
		}
	});
	//shortcut for events
	KolaArray.forEach('click,mouseover,mouseout,mouseup,mousedown,mousemove,keyup,keydown,keypress,focus,blur,submit,change'.split(','),function(functionName){
		exports.prototype[functionName] = function(listenerfn,option){
			for(var i = 0; i < this.length; i++){
				if(!listenerfn){
					if(functionName == "submit")
						this[i].submit();
					if(functionName == "focus")
						this[i].focus();
					else
						KolaDomEvent.fire(this[i], functionName);
				}else{
					KolaDomEvent.on(this[i], functionName, listenerfn, option);
				}
			}
			return this;
		}
	});
	
	return exports;
});