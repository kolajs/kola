/**
 * @kola.bom.Browser 浏览器支持类
 * @author Jady Yang
 * @module kola.bom
 */

kola('kola.bom.Browser', null, function() {
	var agent = navigator.userAgent,
		render,version;

	//	判断是何种渲染模式
	if ( agent.indexOf( 'MSIE' ) != -1 ) {
		render = 'ie';
	} else if ( agent.indexOf( 'AppleWebKit' ) != -1 ) {
		render = 'webkit';
	} else if ( agent.indexOf( 'Gecko' ) != -1 ) {
		render = 'gecko';
	} else if ( agent.indexOf( 'Presto' ) != -1 ) {
		render = 'Presto';
	} else {
		render = 'unkown';
	}
	//判断版本
	switch ( render ) {
		case 'ie':
			version = parseInt( agent.substr( agent.indexOf( 'MSIE' ) + 5, 3 ) );
			break;
		case 'webkit':
			version = parseInt( agent.substr( agent.indexOf( 'AppleWebKit' ) + 12, 4 ) );
			break;
		case 'gecko':
		    version = parseInt( agent.substr( agent.indexOf( 'Gecko' ) + 6, 8 ) );
			break;
		case 'presto':
			version = parseInt( agent.substr( agent.indexOf( 'Presto' ) + 7, 3 ) );
			break;
	}
	/**
	 * kola的事件分发器接口
	 * 
	 * @class Browser
	 * @static
	 */
	return {
		/**
		* 获取渲染内核模式
		* @property render
		* @type {String} ie|webkit|gecko|presto|unkown
		*/
		render: render,
		/**
		* 获取渲染内核版本
		* @property renderVersion
		* @type {String}
		*/
		renderVersion: version,
		
		/**
		* 浏览器是否为ie内核
		* @property IE
		* @type {Boolean}
		*/
		IE : (render == 'ie'),
		/**
		* 浏览器是否为ie6内核
		* @property IE6
		* @type {Boolean}
		*/
		IE6 : (render == 'ie' && version == 6),
		/**
		* 浏览器是否为ie6~8内核
		* @property IEStyle
		* @type {Boolean}
		*/
		IEStyle : (render == 'ie' && version < 9),
		/**
		* 浏览器是否为Webkit内核
		* @property Webkit
		* @type {Boolean}
		*/
		Webkit : (render=='webkit'),
		/**
		* 浏览器是否为Gecko内核
		* @property Gecko
		* @type {Boolean}
		*/
		Gecko : (render=='gecko')
	};
});