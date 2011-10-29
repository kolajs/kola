
/**
 * @fileOverview kola.html.Select 为kola.html.Element扩展增强的Select插件
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.html.Select',
null,
function() {
		
	return {

		/**
		 * 获取某个option
		 * @method options
		 * @return {String} value值
		 */
		options: function( index ) {
			var arg0Type = typeof( arguments[0] ),
				element = this._elements[0];

			switch ( arg0Type ) {

				//	表示要获取某个options
				case 'number':
					return this.constructor( element.options[ arguments[0] ] );
					break;
			}
		},

		/**
		 * 获取可选值数量
		 */
		/**
		 * 设置可选值数量
		 */
		length: function( value ) {
			var element = this._elements[0];
			if ( typeof value == 'undefined' ) {
				return element.length;
			} else {
				element.length = value;
				return this;
			}
		}
	};
	
});