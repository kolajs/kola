/**
 * @fileOverview kola.bom.Event 事件支持类
 * @author Jady Yang
 * @version 2.0.0
 * @fix scope bug 2011-03-30 by flyhuang
 */


kola('kola.bom.Event', 
	[ 'kola.lang.Function', 'kola.lang.Array' ,'kola.bom.Browser','kola.lang.Class'],
	function( KolaFunction, KolaArray ,B,C) {
	
	/********************************************** 类定义 **********************************************/
    /**
        kola事件对象
        
        target
        relatedTarget
        currentTarget
        preventDefault
        stopPropagation
        
        keyCode
        
        stop
    */
    var copyParams=["keyCode","ctrlKey"];
    function DomEvent(e){
        this.event=e;
        if(B.isIEStyle){
            this.target=e.srcElement;
            this.relatedTarget = ( e.fromElement == e.srcElement ? e.toElement : e.fromElement );
            if(e.button==1)
                this.button=0;
            if(e.button==4)
                this.button=1;
            if(e.button==2)
                this.button=2;
        }else{
            this.target=e.target;
            this.button=e.button;
            this.relatedTarget = e.relatedTarget;
        }
        for(var i=0,il=copyParams;i<il;i++){
            this[copyParams[i]]=e[copyParams[i]];
        }
        //TODO copy params
     }
     if(B.isIEStyle){
         C.buildProto(DomEvent,{
             preventDefault:function(){this.event.returnValue=false;},
             stopPropagation:function(){this.event.cancelBubble=true;}
         });
     }else{
         C.buildProto(DomEvent,{
             preventDefault:function(){this.event.preventDefault()},
             stopPropagation:function(){this.event.stopPropagation()}
         });
     }
     DomEvent.prototype.stop=function(){
        this.preventDefault();
        this.stopPropagation();
     }
	/**
	 *
	 * @param element
	 * @param name
	 * @param listenerfn
	 */
	var eventAgent = function( listenerfn, option, e ) {
		if ( B.isIEStyle ) {
            e= new DomEvent(window.event);
			e.currentTarget = this;
		}else{
            e= new DomEvent(e);
        }
		listenerfn.call( option.scope||this, e );
	};
    //light bind
    function eventBind(callbackfn,scope,listenerfn,option) {
        return function(e) {
            return callbackfn.call(scope,listenerfn,option,e);
        };
    }
	/**
	 * 删除指定的事件
	 */
	var remove = function( element, name, listenerfn, obj ) {
		//	删除listener
		if ( element.removeEventListener ) {
			element.removeEventListener( name, listenerfn, false );
		} else {
			//	如果是监听checkbox input的onchange事件，那就需要监听替代的事件。这样做主要是解决，ie9之前，点击checkbox input时，并不会马上出发onchange事件，而是在失焦后出发onchange事件的问题
			if ( name == 'change' && element.tagName && element.tagName.toLowerCase() == 'input' && element.type == 'checkbox' ) {
				CheckboxChange.un( element, obj );
			} else {
				element.detachEvent( 'on' + name, listenerfn );
			}
		}
	};
	
	/**
	 * 是否会引起内存泄露，主要是针对小于IE8的IE版本
	 */
	var willLeak = window.ActiveXObject && !window.XDomainRequest;
	
	/**
	 * 常见的inline事件
	 */
	var inlineEvents = [
		'onclick', 'ondblclick', 'onmouseover', 'onmouseout', 'onmouseup', 'onmousedown',
		'onblur', 'onfocus', 'onchange', 'onsubmit'
	];

	var KEvent = {
        
		/**
		 * 监听一个事件
		 */
		on: function(element, name, listenerfn, option) {
			if ( !element || !name || !listenerfn ) return this;
			
			//	如果是IE7下触发unload事件，那就直接设置方法
			if ( name == 'unload' && element == window && willLeak ) {
				element.onunload = listenerfn;
				return this;
			}

			//	如果不存在事件存储器的话，那就建立之
			var events = element.__events;
			if( !events ) {
				events = element.__events = {};
			}

			//	如果不存在指定类型的事件存储器，那就建立之
			var eventType = events[ name ];
			if( !eventType ) {
				eventType = events[ name ] = [];
			}

			var obj;

			//	如果是采用attachEvent方法监听事件，那就进行一些特殊处理
			if ( B.isIEStyle ) {
				//	某一个方法只能监听某一个对象的某一个事件一次。主要是解决ie9之前的ie，同一方法可以监听同一对象的同一事件，多次的问题
				for ( var i = eventType.length - 1; i >= 0; i-- ) {
					if ( eventType[ i ].l == listenerfn ) {
						return this;
					}
				}
            }
            
            //	建立替代方法，主要是设定作用域
            obj = {
                l: listenerfn,
                h: eventBind(eventAgent, element, listenerfn, option||{})
            };

			//	缓存事件处理方法
			eventType.push( obj );
					
			//	绑定事件
			if ( !B.isIEStyle ) {
				element.addEventListener( name, obj.h, false );
			} else {
				//	如果是监听checkbox input的onchange事件，那就需要监听替代的事件。这样做主要是解决，ie9之前，点击checkbox input时，并不会马上出发onchange事件，而是在失焦后出发onchange事件的问题
				if ( name == 'change' && element.tagName && element.tagName.toLowerCase() == 'input' && element.type == 'checkbox' ) {
					CheckboxChange.on( element, obj.h, obj );
				} else {
					element.attachEvent( 'on' + name, obj.h );
				}
			}
					
			return this;
		},
		
		/**
		 * 取消对事件的监听
		 */
		un: function( element, name, listenerfn ) {
			if ( !element ) return this;

			//	如果不存在事件缓存，那就不做处理
			var events = element.__events;
			if( !events ) return this;
			
			//	如果不存在要移除的事件，那就是移除所有事件
			var listeners;
			if ( typeof name == 'undefined' ) {
				//	移除所有事件
				for ( var key in events ) {
					if ( key == 'out' ) {
						//	如果是out事件，那就删除所有out事件
						KEvent.unout( element );
					} else {
						listeners = events[ key ];
						if ( typeof listeners != 'object' || ( listeners == null ) || !listeners.length ) continue;
						
						//	循环取消所有事件监听
						for ( var i = listeners.length - 1; i >= 0; i-- ) {
							var listener = listeners[i];
							remove( element, key, listener.h, listener );
						}
					}
				}
				
				//	删除常见的inline事件
				for ( var j = inlineEvents.length - 1; j >= 0; j-- ) {
					element[ inlineEvents[ i ] ] = null;
				}
				
				//	清除事件缓存
				element.__events = null;
				element.__events = undefined;
			} else {
				//	移除指定事件的监听
				
				//	如果不存在该类型的事件存储器，那就不做处理
				listeners = events[name];
				if( !listeners ) return this;

				if( listenerfn ) {
					//	这是要取消指定的监听方法
	
					//	循环所有存储的事件处理方法，如果相同，那就删除之
					var funcName = element.addEventListener ? 'h' : 'l';
					for( var i = listeners.length - 1; i >= 0; i-- ) {
						var eventObj = listeners[i];
						if ( eventObj[funcName] == listenerfn ) {
							remove( element, name, eventObj.h, eventObj );
							listeners.splice( i, 1 );
							break;
						}
					}
		
				} else {
					//	删除所有监听事件
					for( var i = 0, il = listeners.length; i < il; i++ ) {
						remove( element, name, listeners[i].h, listeners[i] );
					}
	
					//	删除缓存
					delete events[name];
				}		
				return this;
			}
		},
		
		/**
		 * 监听发生在外部的某个事件
		 */
		onout: function(element, name, listenerfn) {
			var f = KEvent._listener.out(element, name, listenerfn),
				kolaEvent = element.__events;
			if ( !kolaEvent ) {
				kolaEvent = element.__events = {
					out: []
				};
			} else if ( !kolaEvent.out ) {
				kolaEvent.out = [];
			}
			
			kolaEvent.out.push({n: name, l: listenerfn, f: f});
			KEvent.on(document.body, name, f);
			
			return this;
		},
		
		/**
		 * 取消对外部某个事件的监听
		 */
		unout: function(element, name, listenerfn) {
			var events;
			if ((events = element.__events) && (events = events.out) && (events.length > 0)) {
				
				if ( listenerfn ) {
					for (var i = 0, il = events.length; i < il; i++) {
						var event = events[i];
						if (event.n === name && event.l === listenerfn) {
							KEvent.un(document.body, name, event.f);
							events.splice(i, 1);
							break;
						}
					}
				} else {
					
					if ( !name ) {
						//	删除所有监听事件
						
						for( var i = 0, il = events.length; i < il; i++ ) {
							var event = events[i];
							KEvent.un(document.body, event.n, event.f);
						}
		
						//	删除缓存
						element.__events.out = null;
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
		 * 获取该事件发生时，其在页面上的位置
		 * @param e
		 */
		pagePos: function(e) {
			var x, y;
			if ( typeof( e.x ) == 'number' ) {
				var doc = document.documentElement, body = document.body;
				x = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
				y = e.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
			} else {
				x = e.pageX;
				y = e.pageY;
			}
			return {
				x: x,
				y: y,
				left: x,
				top: y
			};
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

	/* ---------------------------------- checkbox input change事件的特殊处理程序 ----------------------------------------*/

	var CheckboxChange = {

		/**
		 * 监听方法
		 */
		on: function( element, listenerfn, obj ) {
			//	设定两个方法
			var clickfn = KolaFunction.bind( CheckboxChange.fire, this, element, listenerfn );
			var keypressfn = KolaFunction.bind( CheckboxChange.keypress, this, element, listenerfn );

			//  记录监听方法
			obj.click = clickfn;
			obj.keypress = keypressfn;

			//  监听替代变量
			Event.on( element, 'click', clickfn );
			Event.on( element, 'keypress', keypressfn );
		},

		/**
		 * 取消对元素的替代事件的监听
		 */
		un: function( element, obj ) {
			Event.un( element, 'click', obj.click );
			Event.un( element, 'keypress', obj.keypressfn );
		},

		/**
		 * keypress事件的处理方法
		 */
		keypress: function( element, listenerfn, e ) {
			//	如果当前按的是空格，那就触发onchange事件
			if ( e.keyCode == 32 ) {
				CheckboxChange.fire( element, listenerfn );
			}
		},

		/**
		 * 触发change事件
		 */
		fire: function( element, listenerfn ) {
			//	循环每个监听change的处理器，调用之执行
			KolaArray.forEach( element.__events[ 'change' ], function( obj ) {
				var e = {
					srcElement: element,
					type: 'change'
				};
				obj.h( e );
			} );
		}
	};

	return KEvent;
	
});