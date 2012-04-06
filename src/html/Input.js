
/**
 * @fileOverview kola.html.Input 为kola.html.Element扩展增强的Input插件
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.html.Input',
[ 'kola.lang.Array', 'kola.bom.Event' ],
function( kolaArray, Event ) {

	return {

		/**
		 * 获取value值
		 * @method value
		 * @return {String} value值
		 */
		/**
		 * 设置value值
		 * @method value
		 * @param value {String} 要设置的value值
		 * @return {*} 当前对象
		 */
		val: function(value) {
			if ( typeof(value) == 'undefined' ) {
				//	表示要获取value值

				var element = this._elements[0];
				value = element.value;

				//	如果存在placeholder并且与值相同时，那就返回空字符串
				var placeholder;
				if ( ( typeof ( placeholder = element.placeholder ) == 'string' || typeof ( placeholder = element.getAttribute( 'placeholder' ) ) == 'string' )
						&& value === placeholder ) {
					value = '';
				}

				return value;
			} else {
				//	表示要设置value
				var elements = this._elements;
				for (var i = 0, il = elements.length; i < il; i++) {
					elements[i].value = value;
				}
				return this;
			}
		},

		/**
		 * 获取或设置是否checked
		 * @param checked
		 */
		checked: function( checked ) {
			var element = this._elements[0];
			if ( typeof checked != 'undefined' ) {
				element.checked = checked;
				return this;
			} else {
				return element.checked;
			}
		},

		/*-------------------------------------- 事件相关 --------------------------------------*/

		/**
		 * 监听单击事件
		 * @param listenerfn
		 */
		change: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.on(element, 'change', listenerfn);
			});
			return this;
		},

		/**
		 * 监听focus事件
		 * @param listenerfn
		 */
		focus: function( listenerfn ) {
			if ( arguments.length == 0 ) {
				this._elements[0].focus();
			} else {
				kolaArray.forEach(this._elements, function(element) {
					Event.on(element, 'focus', listenerfn);
				});
			}
			return this;
		},

		/**
		 * 监听blur事件
		 * @param listenerfn
		 */
		blur: function( listenerfn ) {
			kolaArray.forEach(this._elements, function(element) {
				Event.on(element, 'blur', listenerfn);
			});
			return this;
		}
	};
	
});