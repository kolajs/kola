kola('kola.html.Event', [
    'kola.bom.Event',
    'kola.lang.Array',
    'kola.event.Dispatcher'
],function(E,A,Dispatcher){
    var domEventType='click,mouseover,mouseout,mouseenter,mouseleave,mouseup,mousedown,mousemove,keyup,keydown,keypress,focus,blur,submit'
    var DomEvent={
        /**
		 * 监听事件
		 * @param {String} name 监听的事件名称
		 * @param {Function} listenerfn 事件处理方法
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		on: function(name, listenerfn, option) {
            if(domEventType.indexOf(name)){
                this._each( function(element) {
                    E.on(element, name, listenerfn,option);
                });
            }else{
                Dispatcher.prototype.on.call(name, listenerfn, option)
            }
			return this;
		},
		
		/**
		 * 取消对事件的监听
		 * @param {String} name 监听的事件名称
		 * @param {Function} listenerfn 事件处理方法
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		off: function(name, listenerfn) {
            if(domEventType.indexOf(name)){
                this._each( function(element) {
                    E.off(element, name, listenerfn);
                });
            }else{
                Dispatcher.prototype.off.call(name, listenerfn);
            }
			return this;
		},
        fire:function(name){
            if(domEventType.indexOf(name)){
                this._each( function(element) {
                    E.fire(element, name);
                });
            }else{
                Dispatcher.prototype.fire.call(name);
            }
        },
        mouseenter:function(listenerfn, option){
            this._each( function(element) {
				E.on(element,"mouseover", function(e){
                    var from=e.relatedTarget;
                    var to=element;
                    while (from) {
                        if (from == to) return;
                        from = from.parentNode;
                    }
                    listenerfn.call(this, e, option);
                },option);
			});
        },
        mouseleave:function(listenerfn, option){
            this._each( function(element) {
				E.on(element,"mouseout", function(e){
                    var from=e.relatedTarget;
                    var to=element;
                    while (from) {
                        if (from == to) return;
                        from = from.parentNode;
                    }
                    listenerfn.call(this, e, option);
                },option);
			});
        }
        /**
        TODO:
            delegate
            undelegate
            live
            die
            one
            fire
        */
    };
    A.forEach('click,mouseover,mouseout,mouseup,mousedown,keyup,keydown,keypress,focus,blur'.split(','),function(name){
        DomEvent[name]=function(listenerfn,option){
            this._each( function(element) {
				E.on(element,name, listenerfn,option);
			});
        }
    });
    return DomEvent;
});