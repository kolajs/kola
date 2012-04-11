kola('kola.html.Event', 
	['kola.bom.Event','kola.lang.Array'],
function(E,A){
    var DomEvent={
        /**
		 * �����¼�
		 * @param {String} name ������¼����
		 * @param {Function} listenerfn �¼����?��
		 * @return ��ǰ��Element����
		 * @type kola.html.Element
		 */
		on: function(name, listenerfn,option) {
			this._each( function(element) {
				E.on(element, name, listenerfn,option);
			});
			return this;
		},
		
		/**
		 * ȡ����¼��ļ���
		 * @param {String} name ������¼����
		 * @param {Function} listenerfn �¼����?��
		 * @return ��ǰ��Element����
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
        DomEvent[name]=function(listenerfn){
            this._each( function(element) {
				E.on(element,name, listenerfn);
			});
        }
    });
    return DomEvent;
});