kola("kola.bom.Document",
    [":Browser"],
function(B){
    var head = document.getElementsByTagName('head')[0];
    return{
        /**
            ����һ������css
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
            ҳ���С
            @return 
                w:����
                h:�߶�
        */
        pageSize:function(){
            var pageW=document.documentElement.scrollWidth;
            var pageH=document.documentElement.scrollHeight;
            return {w:pageW,h:pageH};
        },
        /**
            ��ͼ��С
            @return 
                w:����
                h:�߶�
        */
        clientSize:function(){
        },
        /**
            ��ͼ��С
            @return 
                w:����
                h:�߶�
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