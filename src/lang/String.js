/**
 * @fileOverview kola.lang.String 字符串类
 * @author Jady Yang
 * @version 2.0.0
 */


kola('kola.lang.String', null, function() {
	
	return {
		
		/**
		 * 去除掉字符串左右两侧的空格
		 * @type Function
		 */
		trim: function(string) {
			var reg = /^\s|\s$/mg;
			return string.replace(reg, '');
		},
		/**
		 * 格式化字符串
		 * @param {String} 需要格式化的字符串
		 * @param {ANY} 格式化参数，参数用逗号分隔
		 * @return 格式化后的新字符串
		 * @type String
		 */
		format:function() {
	    if( arguments.length == 0 )
	        return null;
	    var str = arguments[0];
	    for(var i=1;i<arguments.length;i++) {
	        var re = new RegExp('\\{' + (i-1) + '\\}','gm');
	        str = str.replace(re, arguments[i]);
	    }
	    return str;
		},
		/**
		 * 计算字符串长度，半角字符两个算一个
		 * @param str {String} 字符串
		 * @return {Int} 字符串长度
		 */
		SimpinLen:function(str){
			var half=0,full=0;
			for(var i=0,len=str.length;i<len;i++){
				var c=str.charCodeAt(i);
				if(c>255)
					full++;
				else
					half++;
			}
			return Math.ceil(half/2)+full;
		},
		/**
		 * 按照半角字符两个算一个的规则查找到对应长度为length的字符在实际字符串的索引值
		 * @param str {String} 字符串
		 * @param index {Int} 字符串
		 * @return {Int} 索引值
		 */
		findIndex:function(str,length){
			var full=0;
			for(var i=0,len=str.length;i<len;i++){
				var c=str.charCodeAt(i);
				if(c>255){
					full++;
				}
				else {
					if((i+1)<len){
						c=str.charCodeAt(i+1);
						if(c&&c<256){
							full++;
							i++;
						} else
							full++;
					}
					else 
						full++;					
				}	
				if(full==length){			
					break;
				}
			}
			return i+1;		
		},
		/**
		 * 按照半角字符分割长度为length的子串
		 * @param str {String} 字符串
		 * @param length {Int} 字符串
		 * @return {String} 分割后的子串
		 */
		cutSimpStr:function(str,length){
			return str.substring(0,this.findIndex(str,length));
		}
		
	};
	
});