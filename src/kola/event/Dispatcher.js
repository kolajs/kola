/**
 * @fileOverview kola.event.Dispatcher 事件分发者
 * @author Guan Yuxin
 * @version 2.0.0
 */


kola('kola.event.Dispatcher',[
    'kola.lang.Class',
    'kola.lang.Object',
    'kola.lang.Array'
],function(C,KolaObject,A) {
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
		on: function(name,listener,option) {
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
		off: function(name, listener) {
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
		fire: function(e) {

            if(KolaObject.isString(e)){
                e={
                    type:e
                }
            }
            e.target=this;
            
            if(this._obverver){
                var instanceObserver=this._obverver[e.type];
                if(instanceObserver){
                    for(var i=0;i<instanceObserver.length;i++){
                        var ob=instanceObserver[i];
                        ob.listener.call(ob.option.scope||this,e);
                    }
                }
            }
            if(this.constructor.fire)
                this.constructor.fire(e)
		}
	});
    Dispatcher._obverver={};
	Dispatcher.fire=function(e){
        var instanceObserver=this._obverver[e.type];
        if(instanceObserver){
            for(var i=0,il=instanceObserver.length;i<il;i++){
                var ob=instanceObserver[i];
                ob.listener.call(ob.option.scope||this,e);
            }
        }
    }
    Dispatcher.on=function(name,listener,option){
        if(!this._obverver[name])
            this._obverver[name]=[];
        this._obverver[name].push({listener:listener,option:option||{}});
    }
    Dispatcher.off=function(name,listener){
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
    }
    Dispatcher.__GENE=["_obverver","on","off","fire"];
    return Dispatcher
});