/**
 * @fileOverview kola.net.Ajax Ajax类
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.net.Ajax',
	['kola.lang.Function'],
	function(Function) {
	/********************************************** 类定义 **********************************************/

	/**
	 * request的mock替代方法
	 * @param url
	 * @param options
	 */
	var requestMock = function( url, options ) {

		setTimeout( function() {
			Ajax._onStateChange( options.mock( url, options ), url, options);
		}, 0 );

		return {};
	};

	/**
	 * Ajax类
	 */
	var Ajax = {

		request: function(url, options) {

			//	有默认的设置
			var opt = {
                method: 'get',
                async: true
            };

			//	增加调用者的配置
			for (var it in (options = options || {})) {
				opt[it] = options[it];
			}
			var method = opt.method,
				data = opt.data;

			//	设置默认method
            if ( !method ) {
				method = opt.method = 'get';
			}
            method=method.toLowerCase();
            
            if(typeof(data) != 'string' && typeof(data) != 'undefined'){
                var str="";
                var fist=true;
                for(key in data){
                    if(fist){
                        fist=false;
                        str+=key+"="+data[key];
                    }else{
                        str+="&"+key+"="+data[key];
                    }
                }
                data=str;
            }
			//	如果method只能通过url传递参数，那就放到url上
			if ( ( method == 'get' || method == 'delete' || method == 'put') && typeof(data) == 'string' ) {
                url += (url.indexOf('?') == -1 ? '?' : '&') + data;
                data = null;
            }

			if ( opt.mock ) {
				return requestMock( url, opt );
			}

			//	获取原生Ajax
			var trans = getTransport();

			//	打开Ajax
            trans.open(method, url, opt.async);

			//	如果是post，那就设置内容编码类型
            if ( method == 'post') {
                trans.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
            }

			//	设置ajax的跟踪事件
            trans.onreadystatechange = Function.bind(this._onStateChange, this, trans, url, opt);

			//	发送数据
            trans.send(data || null);

            return trans;
        },

        text: function(url, options) {
            options.format = 'text';
            return this.request(url, options);
        },

        json: function(url, options) {
            options.format = 'json';
            return this.request(url, options);
        },

        xml: function(url, options) {
            options.format = 'xml';
            return this.request(url, options);
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
                            statusText: trans.statusText,
							data:trans.responseText
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

	/**
	 * 获取原生的Ajax
	 */
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