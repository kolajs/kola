kola('kola.html.Event', [
    'kola.bom.Event',
    'kola.lang.Array',
    'kola.event.Dispatcher'
],function(E,A,Dispatcher){
    var DomEvent={
        /**
		 * 监听事件
		 * @param {String} name 监听的事件名称
		 * @param {Function} listenerfn 事件处理方法
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		on: function(name, listenerfn, option) {
			this._each( function(element) {
				E.on(element, name, listenerfn,option);
			});
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
			if(name=="mouseleave")
				name="mouseout";
			if(name=="mouseenter")
				name="mouseover";
			this._each( function(element) {
				E.off(element, name, listenerfn);
			});
			return this;
		},
        fire:function(name){
			this._each( function(element) {
				E.fire(element, name);
			});
        },
        mouseenter:function(listenerfn, option){
			option = option||{}
			option._definer = listenerfn;
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
			option = option||{}
			option._definer = listenerfn;
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
    A.forEach('click,mouseover,mouseout,mouseup,mousedown,mousemove,keyup,keydown,keypress,focus,blur,submit,change'.split(','),function(name){
        DomEvent[name]=function(listenerfn,option){
            this._each( function(element) {
                if(!listenerfn){
                    if(name=="submit")
                        element.submit();
                    if(name=="focus")
                        element.focus();
                    else
                        E.fire(element, name);
                }else{
                    E.on(element, name, listenerfn, option);
                }
			});
            return this;
        }
    });
    return DomEvent;
});