kola('kola.html.util.Event',[
	'kola.lang.Class',
	'kola.html.util.Selector'
],function(KolaClass, Selector) {
	/********************************************** 类定义 **********************************************/
	var IEStyle = (navigator.userAgent.indexOf('MSIE') != -1 && parseInt(navigator.userAgent.substr(navigator.userAgent.indexOf( 'MSIE' ) + 5, 3)) < 9);
	//FIXME:给window绑定onscroll事件没有位置信息
	var copyParams=["keyCode","componentKey","shiftKey","clientX","clientY","screenX","screenY", "offsetX", "offsetY", "wheelDeltaY","wheelDeltaX","wheelDelta"];
	/*
	 * kola事件对象
	 * @prop currentTarget 绑定时没有设置option.delegate时，currentTarget为绑定该事件的元素，设置option.delegate时，currentTarget为被代理的元素
	 * @prop event: 浏览器内置事件对象
	 * @prop button: w3c兼容
	 * @method preventDefault: w3c兼容
	 * @method stopPropagation: w3c兼容
	 * @method stop: preventDefault & stopPropagation
	 */
	if(IEStyle){
		var DomEvent = KolaClass.create({
			_init :function(e){
				this.event = e;
				
				this.target = e.srcElement;
				
				this.relatedTarget = (e.fromElement == e.srcElement ? e.toElement : e.fromElement);
				
				if(e.button == 1)
					this.button = 0;
				if(e.button == 4)
					this.button = 1;
				if(e.button == 2)
					this.button = 2;

				this.pageY = e.clientY + document.documentElement.scrollTop;
				this.pageX = e.clientX + document.documentElement.scrollLeft;
				
				for(var i =0 ,il = copyParams.length; i < il; i++){
					this[copyParams[i]] = e[copyParams[i]];
				}
			},
			preventDefault:function(){this.event.returnValue = false;},
			stopPropagation:function(){this.event.cancelBubble = true;}
		});
	}else{
		var DomEvent = KolaClass.create({
			_init :function(e){
				this.event = e;
				this.target = e.target;
				this.button = e.button;
				this.relatedTarget = e.relatedTarget;
				this.pageX = e.pageX;
				this.pageY = e.pageY;
				for(var i = 0,il = copyParams.length;i < il; i++){
					this[copyParams[i]] = e[copyParams[i]];
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
	DomEvent.prototype.stop = function(){
		this.preventDefault();
		this.stopPropagation();
	}
	
	var eventAgent = function(callback, options, e) {
		
		if(IEStyle){
			e = new DomEvent(window.event);
		}else{
			e = new DomEvent(e);
		}
		e.currentTarget = this;
		if(options.special && options.special.check && options.special.check(this, e)){
			return;
		}
		//当前事件是代理,则从target开始，向上查找符合delegate的dom，直到找到或者到达该元素
		if(options.delegate){
			var elem = e.target;
			var match = false;
			while(elem.nodeType == 1 && elem != this){
				if(Selector.matchesSelector(elem,options.delegate)){
					match = elem;
					break;
				}
				elem = elem.parentNode;
			}
			//若target不是delegate的一部分，则放弃事件
			if(!match)
				return;
			e.currentTarget = elem;
		}		
		callback.call(options.scope || this, e, options.data);
	};
	//light bind
	function eventBind(target, scope, callback, options) {
		return function(e) {
			return target.call(scope, callback, options, e);
		};
	}
	//删除指定的事件
	var off = function(element, name, callback, observer) {
		//	删除listener
		if (!IEStyle) {
			element.removeEventListener(name, callback, false);
		} else {
			element.detachEvent("on" + name, callback);
		}
	};
	function relationCheck(element, evt){
		var from = evt.relatedTarget;
		while (from) {
			if (from == element) return true;
			from = from.parentNode;
		}
		return false;
	}
	var specialEvent = {
		mouseenter: {
			domEvtName: "mouseover",
			check: relationCheck
		},
		mouseleave: {
			domEvtName: "mouseout",
			check: relationCheck
		}
	}
	if(IEStyle){
		specialEvent.change = {
			//ie6-7的change在失焦后才会触发
			setup: function(element, callback, observer){
				if(element.tagName.toLowerCase() == 'input' && element.type == 'checkbox'){
					observer.name = 'propertychange';
				}
			},
			check: function(element, evt){
				return evt.type === 'value';
			}
		}
		/*
		specialEvent.unload = {
			setup: function(element, callback, options){
				if(element == window){
					window.onunload = callback;
					return true;
				}
			}
		}
		*/
	}
	//常见的inline事件
	var inlineEvents = [
		'onclick', 'ondblclick', 'onmouseover', 'onmouseout', 'onmouseup', 'onmousedown',
		'onblur', 'onfocus', 'onchange', 'onsubmit'
	];
	/**
	 * kola的事件类
	 * 
	 * @class Event
	 */
	var exports = {
		/**
		 * 监听一个事件
		 * @method on
		 * @param element {kolaElement} 要绑定事件的元素
		 * @param name {String} 事件名称
		 * @param callback {function} 事件的处理函数
		 * @param [options] {object} 配置参数
		 *	@param [options.scope] {Object} 指定处理函数的this，如果没有，则默认为element
		 *	@param [options.data] {ANY} 绑定事件时附带的参数，事件处理时会附加在回调函数的参数后面
		 *	@param [options.delegate] {Stirng} 代理事件，如果设置，只有符合该选择器的子元素才会触发事件，并且currentTarget指向被代理的元素
		 */
		on: function(element, name, callback, options, extra) {
			options = options || {};

			var special = extra || specialEvent[name];
			var domName = special && special.domEvtName ? special.domEvtName : name;
			options.special = special;
			//	建立替代方法，主要是设定作用域
			var observer = {
				name: domName,
				definer: callback,
				handler: eventBind(eventAgent, element, callback, options),
				options: options
			};
			
			//	缓存事件处理方法
			((element.__events || (element.__events = {}))[name] || (element.__events[name] = [])).push(observer);
			
			if(special && special.setup && special.setup(element, name, callback, observer)){
				return;
			}
			//	绑定事件
			if (!IEStyle) {
				element.addEventListener(observer.name, observer.handler);
			} else {
				element.attachEvent('on' + observer.name, observer.handler);
			}

		},
		
		/**
		 * 取消元素的指定事件处理
		 * @method off
		 * @param element {HTMLElement} 要解除事件绑定的元素
		 * @param [name] {String} 要解除事件绑定的类型 若不存在，则解绑全部事件，包括inline的
		 * @param [callback] {Function} 要解除事件绑定的处理函数 若不存在，则认为其他callback全部符合解绑条件
		 * @param [options] {Object} 要解除事件绑定的处理函数的参数 若不存在，则认为其他option全部符合解绑条件
		 * @retrun null
		 */
		off: function(element, name, callback, options) {
			//	如果不存在事件缓存，那就不做处理
			var events = element.__events;
			if(!events) return;
			
			//	如果不存在要移除的事件，那就是移除所有事件
			var eventType;
			if (!name) {//	移除所有事件
				
				for (var key in events) {
					eventType = events[key];
					//	循环取消所有事件监听
					for (var i = eventType.length - 1; i >= 0; i--) {
						var observer = eventType[i];
						off(element, key, observer.handler, observer);
					}
				}
				
				//	删除常见的inline事件
				for (var i = inlineEvents.length - 1; i >= 0; i--) {
					element[inlineEvents[i]] = null;
				}
				
				delete element.__events;
			} else {
				//	如果不存在该类型的事件存储器，那就不做处理
				eventType = events[name];
				if (!eventType) return;

				if (callback || options) {//	这是要取消指定的监听方法
					//	循环所有存储的事件处理方法，如果相同，那就删除之
					for(var i = eventType.length - 1; i >= 0; i--) {
						var observer = eventType[i];
						if ((!callback || observer.definer == callback) && (!options || compareOptions(options, observer.options))) {
							off(element, observer.name, observer.handler);
							eventType.splice(i, 1);
						}
					}
				} else {
					//	删除所有监听事件
					for(var i = 0, il = eventType.length; i < il; i++) {
						var observer = eventType[i];
						off(element, observer.name, eventType[i].handler);
					}
					//	删除缓存
					delete events[name];
				}		
			}
		},
		/**
		 * 派发事件
		 * @method fire
		 * @param element {HTMLElement} 触发事件的对象
		 * @param name {String} 事件的名称
		 * @param [event] {Object} 事件的参数
		 * @return null
		 */
		fire: function(element, name, event) {
			if (name == 'submit')
				element.submit();
			if (name == 'focus')
				element.focus();
			else{		
				if(IEStyle) {
					element.fireEvent("on"+name);
				}else{
					var evt = document.createEvent('HTMLEvents');  
					evt.initEvent(name,true,true);
					if(event){
						for(key in event)
							evt[key] = event[key];
					}
					element.dispatchEvent(evt);
				}
			}
		}
	};
	var comparePropertys = ['scope', 'data', 'delegate'];
	function compareOptions(optionsA, optionsB){
		if(!optionsA || !optionsB)
			return false;
		for(var i = 0; i < comparePropertys.length; i++){
			if(optionsA[comparePropertys[i]] !== optionsB[comparePropertys[i]]) return false;
		}
		return true;
	}
	return exports;
});