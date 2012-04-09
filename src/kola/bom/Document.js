kola("kola.bom.Document",
    [":Browser"],
function(B){
    var head = document.getElementsByTagName('head')[0];
    return{
        /**
            生成一块内联css
        */
        createInlineCss:function(text){
            style = document.createElement('style'),
            rules = document.createTextNode(text);
            style.type = 'text/css';
            if(B.isIE) 
                style.styleSheet.cssText = rules.nodeValue;
            else 
                style.appendChild(rules);
            head.appendChild(style);
        },
        /**
            页面大小
            @return 
                w:宽度
                h:高度
        */
        pageSize:function(){
            var pageW=document.documentElement.scrollWidth;
            var pageH=document.documentElement.scrollHeight;
            return {w:pageW,h:pageH};
        },
        /**
            视图大小
            @return 
                w:宽度
                h:高度
        */
        clientSize:function(){
        },
        /**
            视图大小
            @return 
                w:宽度
                h:高度
        */
        scroll:function(){
            if(B.isIE){
                return{
                    top:document.documentElement.scrollTop,
                    left:document.documentElement.scrollLeft
                } 
            }else{
                return{
                    top:document.body.scrollTop,
                    left:document.body.scrollLeft
                } 
            }
        }
    }
})