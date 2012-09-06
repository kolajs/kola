/**
 * kola.event.Dispatcher 包, 事件分发者
 * @author Guan Yuxin
 * @module kola.event
 */

kola('kola.event.Dispatcher',[
	'kola.lang.Class'
],function(KolaClass) {
	/**
	 * kola的事件分发器类
	 * 
	 * @class Dispatcher
	 * 
	 */
	var Dispatcher = KolaClass({
		_init: function() {
		},
		/**
		 * 监听某个事件
		 * @property _dispatcherparent_
		 * @private
		 * @type {Dispatcher}
		 */
		//_dispatcherparent_: , //global Dispatcher
		/**
		 * 监听某个事件
		 * @method on
		 * @param name {String} 事件名称
		 * @param listener {Function} 监听者
		 * @param [option] {Object}
		 * 	@param [option.scope] {Object} 回调函数的执行作用域
		 * 	@param [option.data] {Object} 回调时的额外数据
		 * @chainable
		 */
		on: function(name, listener, option) {
			if(!this._obverver_)
				this._obverver_ = {};
			if(!this._obverver_[name])
				this._obverver_[name] = [];
			this._obverver_[name].push({listener: listener, option: option || {}});
			return this;
		},

		/**
		 * 取消对某个事件的监听
		 * @method off
		 * @param {String} name 事件名称
		 * @param {Function} listener 监听者
		 * @chainable
		 */
		off: function(name, listener) {
			if(!this._obverver_ || !this._obverver_[name])    return;
			if(!listener)
				this._obverver_[name] = [];
			else{
				for(var i = 0; i < this._obverver_[name].length; i++){
					if(this._obverver_[name][i].listener == listener)
						break;
				}
				if(i != this._obverver_[name].length)
					this._obverver_[name].splice(i,1);
			}
			return this;
		},
		/**
		 * 代理另一个事件对象的所有事件
		 * @method delegate
		 * @param dispatcher {Dispatcher} 被代理的事件对象
		 * @chainable
		 */
		delegate: function(dispatcher){
			this._dispatcherparent_ = dispatcher._dispatcherparent_
			dispatcher._dispatcherparent_ = this;
			return this;
		},
		/**
		 * 触发某个事件
		 * @method fire
		 * @param name {String} 事件名称
		 * @chainable
		 */
		 /**
		 * 触发某个事件
		 * @method fire
		 * @param e {Object} 事件对象
		 * @chainable
		 */
		fire: function(e) {

			if(KolaClass.isString(e)){
				e = {
					type:e
				}
			}
			e.target = this;
			var target = this;
			while(target){
				if(target._obverver_ && target._obverver_[e.type]){
					var observers = target._obverver_[e.type];
					if(observers){
						for(var i = 0; i < observers.length; i++){
							var ob = observers[i];
							ob.listener.call(ob.option.scope || this, e);
						}
					}
				}
				target = target._dispatcherparent_;
			}

			return this;
		}
	});
	var global = new Dispatcher();
	global._dispatcherparent_ = null;
	/**
	 * 全局监听器
	 * @property global
	 * @static
	 * @type {Dispatcher}
	 */
	Dispatcher.global = global;
	Dispatcher.prototype._dispatcherparent_ = global;
	return Dispatcher
});