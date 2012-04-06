/**
 * @fileOverview kola.bom.Dispatcher 事件分发者
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.bom.Dispatcher',
	['kola.lang.Class'],
	function( Class ) {
	
	/********************************************** 类定义 **********************************************/
	return Class.create({
		_init: function() {
			this._listeners = {};
		},
		
		/**
		 * 监听某个事件
		 * @param {String} name 事件名称
		 * @param {Function} listener 监听者
		 */
		on: function(name, listener) {
			//	TODO: 返回值也需要考究
			var listeners = this._listeners[name];
			if (typeof(listeners) != 'object') {
				listeners = this._listeners[name] = [];
			}
			listeners.push(listener);
		},

		/**
		 * 取消对某个事件的监听
		 * @param {String} name 事件名称
		 * @param {Function} listener 监听者
		 */
		un: function(name, listener) {
			//	TODO: 返回值也需要考究
			var listeners = this._listeners[name];
			if (typeof(listeners) != 'object') {
				return;
			}

			for (var i = 0, il = listeners.length; i < il; i++) {
				if (listeners[i] == listener) {
					listeners = listeners.splice(i, 1);
					return;
				}
			}
		},

		/**
		 * 触发某个事件
		 * @param {String} name 事件名称
		 * @param {Object} e 事件对象
		 * @param {Function} listener 单独被触发的listener，如果不存在，那就触发所有的listener
		 */
		fire: function(name, e, listener) {
			//	TODO: 返回值也需要考究
			var listeners = this._listeners[name];
			if (typeof(listeners) != 'object') {
				return;
			}

			//	如果不存在事件对象，那就创建之
			if ( !e ) {
				e = {};
			}
			e.type = name;

			//	如果存在特定触发的listener，那就执行不同的处理
			var i, il, value;
			if (listener) {
				for (i = listeners.length - 1; i >= 0; i--) {
					if (listeners[i] == listener) {
						//	TODO: 这里需要对e和返回值进行一些处理和解析
						value = listener( e );
					}
				}
			} else {
				for (i = 0, il = listeners.length; i < il; i++) {
					//	TODO: 这里需要对e和返回值进行一些处理和解析
					value = listeners[i]( e );
				}
			}

			return e;
		}
	});
	
});