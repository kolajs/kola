
/**
 * @fileOverview kola.html.Option 为kola.html.Element扩展增强的Option插件
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.html.Option',
	null,
function() {
		
	return {

		/**
		 * 判断当前option是否为选中状态
		 * @method selected
		 */
		selected: function() {
			return this._elements[0].selected;
		}
	};
	
});