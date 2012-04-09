/**
 * @fileOverview kola.bom.Event 事件支持类
 * @author Jady Yang
 * @version 2.0.0
 * @fix scope bug 2011-03-30 by flyhuang
 */


kola('kola.bom.Event', 
	[":Class",":Browser"],
function(C,B) {

    /**
    kola事件对象
    
    preventDefault  阻止默认事件
    stopPropagation 阻止冒泡
    */
    function DomEvent(e){
        this.event=e;
        this.target=e.srcElement;
        this.keyCode=e.keyCode;
    }
    if(C.isIE678){
        C.buildProto(DomEvent,{
            preventDefault:function(){this.event.returnValue=false;},
            stopPropagation:function(){this.event.cancelBubble=true;}
        });
    }else{
        C.buildProto(DomEvent,{
            preventDefault:Event.prototype.preventDefault,
            stopPropagation:Event.prototype.stopPropagation
        });
    }
	/********************************************** 类定义 **********************************************/

	var KolaEvent = {
		
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
					KolaEvent._remove(element, name, listenerfn);
				} else {				
					var events=element.events;
					if(!events) return;
					
					var eventType=events[name];			
					if(!eventType) return;
								
					for(var i=0,len=eventType.length;i<len;i++){
						if(eventType[i].srcHandler==listenerfn){
							KolaEvent._remove(element ,name , eventType[i].handler);
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
					KolaEvent._remove(element, name, eventType[i].handler , true);
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

	return KolaEvent;
	
});