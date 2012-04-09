/**
 * @fileOverview kola.net.Ajax Ajax类
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.net.Ajax',
	['kola.lang.Function'],
	function(Function) {
	/********************************************** 类定义 **********************************************/

	var Ajax = {
        post:function(url,options){
            options.method="post";
            Ajax.request(url,options);
        },
        get:function(url,options){
            options.method="get";
            Ajax.request(url,options);
        },
		request: function(url, options){

            var trans = getTransport();

			var opt = {
                method: 'get',
                async: true,
                format: "json"
            };
			for (var it in (options = options || {})) {
				opt[it] = options[it];
			}
            if (!opt.method) opt.method = 'get';

            if (opt.method == 'get' && typeof(opt.data) == 'string') {
                url += (url.indexOf('?') == -1 ? '?' : '&') + opt.data;
                opt.data = null;
            }

            trans.open(opt.method, url, opt.async);

            if (opt.method == 'post') {
                trans.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
            }

            trans.onreadystatechange = Function.bind(this._onStateChange, this, trans, url, opt);
            trans.send(opt.data || null);
            return trans;
        },
        _onStateChange: function(trans, url, options) {
            if (trans.readyState == 4) {
                trans.onreadystatechange = function() {};
                var s = trans.status;
                if ((typeof(s) == 'number') && s >= 200 && s < 300) {
                    if (typeof(options.succ) != 'function') return;

                    var ctt = trans;
                    if (typeof(options.format) == 'string') {
                        switch(options.format) {
                            case 'text':
                                ctt = trans.responseText;
                                break;
                            case 'json':
                                ctt = eval('(' + trans.responseText + ')');
                                break;
                            case 'xml':
                                ctt = trans.responseXML;
                                break;
                        }
                    }
                    options.succ(ctt);
                } else {
               
                    if (window.closed) return;
                    if (typeof(options.fail) == 'function') {
                        var error = {
                            status: trans.status,
                            statusText: trans.statusText
                        }
                        //	判断是否是网络断线或者根本就请求不到服务器
                        if (trans.readyState == 4 && (trans.status == 0 || trans.status == 12030)) {
                            //	是
                            error.status = -1;
                        }
                        options.fail(error);
                    }
                }
            }
        }
	};

	/********************************************** 私有方法 **********************************************/

    var getTransport = function() {
        if (window.XMLHttpRequest) return new XMLHttpRequest();
        else {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
                try {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                } catch (e) {
                    return false;
                }
            }
        }
    };

	/********************************************** 返回类 **********************************************/

	return Ajax;

});