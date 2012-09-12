/**
 * kola html Element 包，提供dom元素的封装
 * 
 * @module kola.html
 */

kola('kola.html.Element',[
	'kola.lang.Class',
	'kola.lang.Array',
	'kola.html.util.Selector',
	'kola.html.util.Operation'
],function(KolaClass, KolaArray, Selector, Operation){
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
	});
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
	//数组排重
	function unique(array){
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
	return exports;
});