kola('kola.html.Event', 
	['kola.bom.Event','kola.lang.Array'],
function(E,A){
    var DomEvent={
        /**
		 * 监听事件
		 * @param {String} name 监听的事件名称
		 * @param {Function} listenerfn 事件处理方法
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		on: function(name, listenerfn,option) {
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
		un: function(name, listenerfn) {
			this._each( function(element) {
				E.un(element, name, listenerfn);
			});
			return this;
		}
        /**
        TODO:
            delegate
            undelegate
            live
            die
            one
        */
    };
    A.forEach('click,mouseover,mouseout,mouseup,mousedown,keyup,keydown,keypress'.split(','),function(name){
        DomEvent[name]=function(listenerfn,option){
            this._each( function(element) {
				E.on(element,name, listenerfn,option);
			});
        }
    });
    return DomEvent;
});