/**
 * @fileOverview kola.bom.Event 事件支持类
 * @author Jady Yang
 * @version 2.0.0
 * @fix scope bug 2011-03-30 by flyhuang
 */


kola('kola.bom.Event', 
	null,
	function() {
	
	/********************************************** 类定义 **********************************************/
    
	var Event = {
		
		/**
		 * 监听一个事件
		 */
		on: function(element, name, listenerfn) {
			if (!element || !name || !listenerfn) return this;
					
			var events=element.events;
			if(!element.events)
				events=element.events={};		
				
			var eventType=events[name];		
			if(!eventType)
				var eventType=events[name]=[];
			
			var fn=function(){
				listenerfn.apply(element,arguments);			
			}
				
			eventType.push({
				srcHandler:listenerfn,
				handler:fn
			});
					
			//	绑定事件
			if (element.addEventListener) {
				element.addEventListener(name, fn, false);
			} else {
				element.attachEvent('on' + name, fn);
			}
					
			return this;
		},
		
		/**
		 * 取消对事件的监听
		 */
		un: function(element, name, listenerfn, origin) {
			if (!element || !name) return this;
							
			if(listenerfn){							
				if(origin){				
					Event._remove(element, name, listenerfn);
				} else {				
					var events=element.events;
					if(!events) return;
					
					var eventType=events[name];			
					if(!eventType) return;
								
					for(var i=0,len=eventType.length;i<len;i++){
						if(eventType[i].srcHandler==listenerfn){
							Event._remove(element ,name , eventType[i].handler);
							eventType.splice(i,1);
							i--;
							len--;
						}
					}		
				}	
	
			} else {							
				var events=element.events;
				if(!events) return;
				
				var eventType=events[name];			
				if(!eventType) return;	
			
				for(var i=0,len=eventType.length;i<len;i++){
					Event._remove(element, name, eventType[i].handler , true);
				}			
				delete events[name];
			}		
			return this;
		},
		
		/**
		 * 删除指定的事件
		 */
		_remove:function(element, name, listenerfn){
			//	删除listener
			if (element.removeEventListener) {
				element.removeEventListener(name, listenerfn, false);
			} else {
				element.detachEvent('on' + name, listenerfn);
			}	
		},
		
		/**
		 * 监听发生在外部的某个事件
		 */
		onout: function(element, name, listenerfn) {
			var f = Event._listener.out(element, name, listenerfn),
				kolaEvent = element._kolaEvent;
			if (!kolaEvent) {
				kolaEvent = element._kolaEvent = {
					out: []
				};
			}
			kolaEvent.out.push({e: element, n: name, l: listenerfn, f: f});
			Event.on(document.body, name, f);
			
			return this;
		},
		
		/**
		 * 取消对外部某个事件的监听
		 */
		unout: function(element, name, listenerfn) {
			var events;
			if ((events = element._kolaEvent) && (events = events.out) && (events.length > 0)) {
		
				for (var i = 0, il = events.length; i < il; i++) {
					var event = events[i];
					if (event.e === element && event.n === name && event.l === listenerfn) {
						Event.un(document.body, name, event.f);
						events.splice(i, 1);
						break;
					}
				}
			}
			
			return this;
		},
		/**
		 * 派发事件
		 * @param element
		 * @param name
		 * @param event
		 */
		fire: function( element, name, event ) {
			//	TODO: 暂时没有内浏览器内置事件增加良好支持

			//	如果没有监听器，那就不做处理
			var listeners;
			if ( !( listeners = element.__events ) || !( listeners = listeners[ name ] ) ) return;

			//	如果不存在事件对象，那就建立之
			event = event || {};
			event.type = name;

			//	循环每个监听器，依次执行之
			for ( var i = 0, il = listeners.length; i < il; i++ ) {
				listeners[ i ].h.call( element, event );
			}
		},		
		/**
		 * 阻止事件的传递和默认行为
		 */
		stop: function(e) {
			Event.stopPropagation(e);
			Event.preventDefault(e);
		},
		
		/**
		 * 阻止事件的传递
		 */
		stopPropagation: function(e) {
			e.cancelBubble = true;
			if (e.stopPropagation) {
				e.stopPropagation();
			}
		},
		
		/**
		 * 阻止事件的默认行为
		 */
		preventDefault: function(e) {
			e.returnValue = false;
			if (e.preventDefault) {
				e.preventDefault();
			}
		},
		
		/**
		 * 获取事件发生的源对象
		 */
		element: function(e) {
			return e.target || e.srcElement;
		},	
		/**
		 * 存储所有特殊事件类型的监听器生成方法
		 */
		_listener: {
			out: function(element, name, listenerfn) {
				return function(e) {
					if (!Event.contains(element,(Event.element(e)))) {
						listenerfn.call(window, e);
					}
				};
			}
		},
		/**
		 * 判断是否包含指定的对象
		 * @param {KolaElement} element 对象
		 * @return true 或者 false
		 * @type boolean
		 */
		contains: function(parent,child) {
			if (!child) return false;
			var element = child;
			while (element = element.parentNode) {
				if (element == parent) return true;
			}
			return false;
		}		
	};

	return Event;
	
});