/**
 * @fileOverview kola.bom.Event 事件支持类
 * @author Jady Yang
 * @version 2.0.0
 * @fix scope bug 2011-03-30 by flyhuang
 */


kola('kola.bom.Event', [
    'kola.lang.Object',
    'kola.lang.Function',
    'kola.lang.Array',
    'kola.bom.Browser',
    'kola.lang.Class',
    'kola.css.Selector'
],function(KolaObject, KolaFunction, KolaArray , B, C, Selector) {
	
	/********************************************** 类定义 **********************************************/

    //FIXME:给window绑定onscroll事件没有位置信息
    var copyParams=["keyCode","ctrlKey","clientX","clientY","screenX","screenY"];
    /**
	 * kola事件对象
	 * @prop currentTarget 绑定时没有设置option.delegate时，currentTarget为绑定该事件的元素，设置option.delegate时，currentTarget为被代理的元素
     * @prop data: 绑定事件时传入的数据
     * @prop event: 浏览器内置事件对象
     * @prop button: w3c兼容
     * @method preventDefault: w3c兼容
     * @method stopPropagation: w3c兼容
     * @method stop: preventDefault & stopPropagation
	 */
    function DomEvent(e){
        this.event=e;
        if(B.IEStyle){
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
        for(var i=0,il=copyParams.length;i<il;i++){
            this[copyParams[i]]=e[copyParams[i]];
        }
     }
     if(B.IEStyle){
         C.buildProto(DomEvent,{
             preventDefault:function(){this.event.returnValue=false;},
             stopPropagation:function(){this.event.cancelBubble=true;}
         });
     }else{
         C.buildProto(DomEvent,{
            preventDefault:function(){
                this.event.preventDefault()
            },
            stopPropagation:function(){
                this.event.stopPropagation()
            }
         });
     }
     DomEvent.prototype.stop=function(){
        this.preventDefault();
        this.stopPropagation();
     }
	
	var eventAgent = function( listenerfn, option, e ) {
		if ( B.IEStyle ) {
            e= new DomEvent(window.event);
		}else{
            e= new DomEvent(e);
        }
        if(option.out){
            var elem=e.target;
            var match=false;
            while(elem.nodeType==1 && elem!=this){
                elem = elem.parentNode;
            }
            e.currentTarget = this;
            if(elem!=this)
                listenerfn.call( option.scope||this, e );
            return;
        }
        //当前事件是代理
        if(option.delegate){
            var elem=e.target;
            var match=false;
            while(elem.nodeType==1 && elem!=this){
                if(Selector.matchesSelector(elem,option.delegate)){
                    match=elem;
                    break;
                }
                elem = elem.parentNode;
            }
            //若target不是delegate的一部分，则放弃事件
            if(!match)
                return;
            e.currentTarget = elem;
        }else{
            e.currentTarget = this;
        }
        if(!KolaObject.isUndefined(option.data))
            e.data=option.data;
        
		listenerfn.call( option.scope||this, e );
	};
    //light bind
    function eventBind(callbackfn,scope,listenerfn,option) {
        return function(e) {
            return callbackfn.call(scope,listenerfn,option,e);
        };
    }
	//删除指定的事件
	var remove = function( element, name, listenerfn, obj ) {
		//	删除listener
		if ( element.removeEventListener ) {
            if(obj.o.out)
                document.removeEventListener( name, listenerfn, false );
            else
                element.removeEventListener( name, listenerfn, false );
		} else {
			//	如果是监听checkbox input的onchange事件，那就需要监听替代的事件。这样做主要是解决，ie9之前，点击checkbox input时，并不会马上出发onchange事件，而是在失焦后出发onchange事件的问题
			if ( name == 'change' && element.tagName && element.tagName.toLowerCase() == 'input' && element.type == 'checkbox' ) {
				CheckboxChange.off( element, obj );
			} else {
                if(obj.o.out)
                    document.detachEvent( "on"+name, listenerfn );
                else
                    element.detachEvent( "on"+name, listenerfn );
			}
		}
	};

	//常见的inline事件
	var inlineEvents = [
		'onclick', 'ondblclick', 'onmouseover', 'onmouseout', 'onmouseup', 'onmousedown',
		'onblur', 'onfocus', 'onchange', 'onsubmit'
	];

	var KEvent = {
		/**
		 * 监听一个事件
         * @param {kolaElement} element 要绑定事件的元素
         * @param {String} name 事件名称
         * @param {function} listenerfn 事件的处理函数
         * @param {object} option 配置参数
                @option {object} scope 指定处理函数的this，如果没有，则默认为element
                @option {ANY} data 绑定事件时附带的参数，事件处理时会附加在event.data中
                @option {selector} delegate 代理事件，如果设置，只有符合该选择器的子元素才会触发事件，并且currentTarget指向被代理的元素
                @option {Boolean} out 指定事件在当前元素之外触发
		 */
		on: function(element, name, listenerfn, option) {
			if ( !element || !name || !listenerfn ) return this;
			option=option||{};
			//	如果是IE7下触发unload事件，那就直接设置方法
			if ( name == 'unload' && element == window && B.IE67 ) {
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

            //	建立替代方法，主要是设定作用域
            obj = {
                l: listenerfn,
                h: eventBind(eventAgent, element, listenerfn, option),
                o: option
            };

			//	缓存事件处理方法
			eventType.push( obj );
					
			//	绑定事件
			if ( !B.IEStyle ) {
                if(option.out){
                    document.addEventListener( name, obj.h, false );
                }else{
                    element.addEventListener( name, obj.h, false );
                }
			} else {
				//	如果是监听checkbox input的onchange事件，那就需要监听替代的事件。这样做主要是解决，ie9之前，点击checkbox input时，并不会马上出发onchange事件，而是在失焦后出发onchange事件的问题
				if ( name == 'change' && element.tagName && element.tagName.toLowerCase() == 'input' && element.type == 'checkbox' ) {
					CheckboxChange.on( element, obj.h, obj );
				} else {
                    if(option.out)
                        document.attachEvent( 'on' + name, obj.h );
                    else
                        element.attachEvent( 'on' + name, obj.h );
				}
			}
					
			return this;
		},
		
		/**
		 * 取消元素的所有事件绑定
         * @param {kolaElement} element 要解除事件绑定的元素
		 */
        
        /**
		 * 取消元素的某个类型事件绑定
         * @param {kolaElement} element 要解除事件绑定的元素
         * @param {String} name 要解除事件绑定的类型
		 */
        
        /**
		 * 取消元素的指定事件处理
         * @param {kolaElement} element 要解除事件绑定的元素
         * @param {String} name 要解除事件绑定的类型
         * @param {Function} listenerfn 要解除事件绑定的处理函数
		 */
		off: function( element, name, listenerfn ) {
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
					for( var i = listeners.length - 1; i >= 0; i-- ) {
						var eventObj = listeners[i];
						if ( eventObj.l == listenerfn ) {
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
		 * 派发事件
		 * @param element
		 * @param name
		 * @param event
		 */
		fire: function( element, name, event ) {
            if(B.IEStyle) {  
                element.fireEvent("on"+name);  
            }else{  
                var evt = document.createEvent('HTMLEvents');  
                evt.initEvent(name,true,true);  
                element.dispatchEvent(evt);  
            }
            /*
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
			}*/
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
		off: function( element, obj ) {
			Event.off( element, 'click', obj.click );
			Event.off( element, 'keypress', obj.keypressfn );
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