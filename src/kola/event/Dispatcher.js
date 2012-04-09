/**
 * @fileOverview kola.bom.Dispatcher 事件分发者
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.event.Dispatcher',
	[':Class',':Type',':Array'],
function(C,Type,A) {
	/********************************************** 类定义 **********************************************/
	var Dispatcher=C.create({
		_init: function() {
		},

		/**
		 * 监听某个事件
		 * @param {String} name 事件名称
		 * @param {Function} listener 监听者
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
		 * 取消对某个事件的监听
		 * @param {String} name 事件名称
		 * @param {Function} listener 监听者
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
		 * 触发某个事件
		 * @param {String} name 事件名称
		 * @param {Object} e 事件对象
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