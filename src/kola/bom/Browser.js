/**
 * @fileOverview kola.bom.Browser 浏览器支持类
 * @author Jady Yang
 * @version 2.0.0
 */
 
kola('kola.bom.Browser',[
	'kola.lang.Function'
],function(KolaFunction) {
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
		Gecko : (render=='gecko'),
		/**
		* 获取浏览器名称
		* @method name
		* @return {String} qq|maxthon|ie|chrome|safari|firefox|opera|unkown(360、遨游)
		*/
		name: function() {
			var agent = navigator.userAgent,
				value;

			switch ( this.render ) {
				case 'ie':
					if ( agent.indexOf( 'QQBrowser' ) != -1 ) {
						value = 'qq';
					} else if ( agent.indexOf( 'Maxthon' ) != -1 ) {
					    value = 'maxthon';
					} else if ( agent.indexOf( 'SE') != -1 && agent.indexOf( 'MetaSr') != -1 ) {
						value = 'sogou';
					} else {
						//	该模式下无法识别出360
						value = 'ie';
					}
					break;
				case 'webkit':
					if ( agent.indexOf( 'Chrome' ) != -1 ) {
						value = 'chrome';
					} else if ( agent.indexOf( 'QQBrowser' ) != -1 ) {
						value = 'qq';
					} else if ( agent.indexOf( 'Maxthon' ) != -1 ) {
					    value = 'maxthon';
					} else if ( agent.indexOf( 'SE') != -1 && agent.indexOf( 'MetaSr') != -1 ) {
						value = 'sogou';
					} else if ( agent.indexOf( 'Version') != -1 && agent.indexOf( 'Safari') != -1 ) {
						value = 'safari';
					} else {
						//	该模式下无法识别出360、遨游
						value = 'unkown';
					}
					break;
				case 'gecko':
				    value = 'firefox';
					break;
				case 'Presto':
					value = 'opera';
					break;
			}

			this.name = KolaFunction.value( value );
			return value;
		}
	};
});