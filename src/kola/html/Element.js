
/**
 * @fileOverview kola.html.Element DOMElement对象类
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.html.Element', 
	['kola.lang.Object','kola.html.ElementCore','kola.html.Event','kola.html.Properties','kola.html.Content','kola.html.Display','kola.html.Traveller'],
function(O,Core,FunEvent,FunProp,FunContent,FunDisp,FunTravel) {

    O.extend(Core.prototype,FunEvent,FunProp,FunContent,FunDisp,FunTravel);
	/********************************************** 插件配置 **********************************************/

	Core.__PLUGIN_CONFIG = {
		type: 'Class'
	};
	
	//debug only
    window.K=Core
	return Core;
	
});