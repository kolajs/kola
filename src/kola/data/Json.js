kola("kola.data.Json",[
    "kola.bom.Browser"
],function(Browser){
    if(Browser.IE){
        return {
            parse:function(data){
                return eval("("+data+")");
            },
            stringify:function(data){
            }
        }
    }else{
        return JSON;
    }
});