/**
 * @fileOverview kola.bom.Event 事件支持类
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.bom.Cookie',null,function() {

	/********************************************** 类定义 **********************************************/

    var Cookie = {
        get: function(name) {
            var tmp, reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)","gi");
            if( tmp = reg.exec( unescape(document.cookie) ) )
                return(tmp[2]);
            return null;
        },

/**
* @function
* @description 设置cookie
* @param name cookie name.
* @param value cookie value, 会自动 escape 然后存储.
* @param expires 失效时间，默认为浏览器session有效.为Date对象
* @param path cookie 存于何 path 下，默认值为种下cookie时的路径.
* @param domain cookie 存于何 domain 下，默认为当前域.
*
* @return
*/
        set: function(name, value, expires, path, domain) {
            var str = name + "=" + escape(value);
            if (expires) {
                if (expires == 'never') {
                    expires = 100*365*24*60;
                }
                var exp = new Date();
                exp.setTime(exp.getTime() + expires*60*1000);
                str += "; expires="+exp.toGMTString();
            }
            if (path) {
                str += "; path=" + path;
            }
            if (domain) {
                str += "; domain=" + domain;
            }
            document.cookie = str;
        },
        remove: function(name, path, domain) {
            document.cookie = name + "=" +
                ((path) ? "; path=" + path : "") +
                ((domain) ? "; domain=" + domain : "") +
                "; expires=Thu, 01-Jan-70 00:00:01 GMT";
        }
    };

	return Cookie;

});