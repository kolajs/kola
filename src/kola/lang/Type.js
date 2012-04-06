/**
@author gyx
*/
kola("kola.lang.Type",[],function(){
    var eye=Object.prototype.toString;
    return{
        isFunction:function(o){
            return (eye.call(o)=="[object Function]");
        },
        isArray:function(o){
            return (eye.call(o)=="[object Array]");
        },
        isString:function(o){
            return (eye.call(o)=="[object String]");
        },
        isRegExp:function(o){
            return (eye.call(o)=="[object RegExp]");
        },
        isNumber:function(o){
            return (eye.call(o)=="[object Number]");
        },
        isUndefined:function(o){
            return (typeof o=="undefined");
        }
    }
})