
/**
 * @fileOverview kola.html.Form 为kola.html.Element扩展增强的Form插件
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.html.Form',
[ 'kola.lang.Array', 'kola.bom.Event' ],
function( KolaArray, Event ) {
		
	return {

		/**
		 * 获取所有控件
		 */
		elementNodes: function() {

			var elements = [],
				results;

			//	循环获得所有控件
			for ( var i = 0, items = [ 'input', 'select', 'textarea' ], il = items.length; i < il; i++ ) {
				if ( results = this.find( items[ i ] ) ) {
					elements = elements.concat( results.elements() );
				}
			}

			if ( elements.length > 0 ) {
				return this.constructor( elements );
			}
			return null;
		},

		/**
		 * 获取form的提交值Map
		 */
		formData: function() {

			var data = {},
				hadData = false;

			//	FIXME: 如果当前对象为form，可以直接使用elements属性获取所有节点
			this.elementNodes().each( function( element ) {
				//	FIXME: 这里没有处理 disabled的状况

				//	如果没有值那就不做任何处理
				var value = element.prop( 'value' );
				if ( typeof value != 'string' ) return;

				//	如果没有名称，那就不做任何处理
				var name = element.prop( 'name' );
				if ( typeof name != 'string' || name.length == 0 ) return;

				//	对不同的类型，需要进行一些不同的处理
				var type = element.prop( 'type' );
				if ( element.prop( 'nodeName' ).toLowerCase() == 'input' && ( type == 'radio' || type == 'checkbox' ) ) {
					//	如果为input[type="radio"]input[type="checkbox"]，而且未选择，那就不做处理
					if ( !element.prop( 'checked' ) ) return;
				} else {
					//	如果存在placeholder并且与值相同时，那就返回空字符串
					var placeholder;
					if ( ( typeof ( placeholder = element.prop( 'placeholder' ) ) == 'string' || typeof ( placeholder = element.attr( 'placeholder' ) ) == 'string' )
							&& value === placeholder ) {
						value = '';
					}
				}
				
				//	设置有值
				hadData = true;

				//	存储值
				var old = data[ name ];
				switch ( typeof old ) {

					//	之前只记录了一条
					case 'string':
						data[ name ] = [ old, value ];
						break;

					//	记录了多条
					case 'object':
						old.push( value );
						break;

					//	没有记录
					default:
					    data[ name ] = value;
				}
			});

			return hadData ? data : null;
		},

		/**
		 * 监听提交事件
		 * @param listenerfn
		 */
		submit: function( listenerfn ) {
			KolaArray.forEach(this._elements, function(element) {
				Event.on(element, 'submit', listenerfn);
			});
			return this;
		}
	};
	
});