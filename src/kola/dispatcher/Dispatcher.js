/**
 * @fileOverview kola.bom.Dispatcher �¼��ַ���
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.dispatcher.Dispatcher',
	[':Class',':Type',':Array'],
function(C,Type,A) {
	/********************************************** �ඨ�� **********************************************/
	var Dispatcher=C.create({
		_init: function() {
		},

		/**
		 * ����ĳ���¼�
		 * @param {String} name �¼����
		 * @param {Function} listener ������
         * @param {Object} option
		 */
		observe: function(name,listener,option) {
            if(!this._obverver)
                this._obverver={};
            if(!this._obverver[name])
                this._obverver[name]=[];
            this._obverver[name].push({listener:listener,option:option||{}});
		},

		/**
		 * ȡ���ĳ���¼��ļ���
		 * @param {String} name �¼����
		 * @param {Function} listener ������
		 */
		unObserve: function(name, listener) {
            if(!this._obverver || !this._obverver[name])    return;
            if(!listener)
                this._obverver[name]=[];
            else{
                for(var i=0;i<this._obverver[name].length;i++){
                    if(this._obverver[name][i].listener==listener)
                        break;
                }
                if(i!=this._obverver[name].length)
                    this._obverver[name].splice(i,1);
            }
		},

		/**
		 * ����ĳ���¼�
		 * @param {String} name �¼����
		 * @param {Object} e �¼�����
		 */
		dispatch: function(e) {
            if(!this._obverver) return;
            if(Type.isString(e)){
                e={
                    type:e
                }
            }
            var instanceObserver=this._obverver[e.type];
            if(instanceObserver){
                for(var i=0,il=instanceObserver.length;i<il;i++){
                    var ob=instanceObserver[i];
                    ob.listener.call(ob.option.scope||this,e);
                }
            }
            if(this.constructor.dispatch)
                this.constructor.dispatch(e)
		}
	});
    Dispatcher._obverver={};
	Dispatcher.dispatch=function(e){
        var instanceObserver=this._obverver[e.type];
        if(instanceObserver){
            for(var i=0,il=instanceObserver.length;i<il;i++)
                var ob=instanceObserver[i];
                ob.listener.call(ob.option.scope||this,e);
        }
    }
    Dispatcher.observe=function(name,listener,option){
        if(!this._obverver[name])
            this._obverver[name]=[];
        this._obverver[name].push({listener:listener,option:option||{}});
    }
    Dispatcher.unObserve=function(name,listener){
        this._obverver[name].push({listener:listener,option:option||{}});
    }
    Dispatcher.__GENE=["_obverver","observe","unObserve","dispatch"];
    return Dispatcher
});