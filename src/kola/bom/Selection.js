/**
 * @author guanyuxin
 * @date 2011.10.26
 * @desc 封装浏览器的selection和range
 */
kola("kola.bom.Selection",[
    "kola.html.Element",
    "kola.bom.Browser"
],function($,Browser){
    function dontStart(e){
        if(!$(e.target).is(":text"))
            return false;
    }
    if(!Browser.IEStyle){
        var Selection={
            clearSelection:function(){//清空window的选择
                if(window.getSelection().anchorNode)
                    window.getSelection().collapseToStart();
            },
            setUnselectable:function(dom){
                $(dom).style("-moz-user-select","-moz-none").style("-webkit-user-select","none");
            },
            setSelectable:function(dom){
                $(dom).style("-moz-user-select","-moz-all").style("-webkit-user-select","auto");
            },
            getRange:function(){
                var selObj = window.getSelection();  
                var range  = selObj.getRangeAt(0);
                if(range.startContainer.nodeType!=3){
                    var dom=range.startContainer.childNodes[range.startOffset];
                    return {
                        startContainer:dom,
                        endContainer:dom,
                        startOffset:dom.selectionStart,
                        endOffset:dom.selectionEnd
                    }
                }
                return range;
            },
            select:function(node,start,end){
                var sel = window.getSelection();
                sel.removeAllRanges();
                var range = document.createRange();
                var dest=node.childNodes[0];
                
                if(typeof start=="undefined"){
                    start=0;
                    end=0;
                }
                if(start==-1){
                    start=dest.length;
                }
                if(typeof end=="undefined"){
                    end=start;
                }
                range.setStart(dest,start);
                range.setEnd(dest,end);
                sel.addRange(range);
            }
        }
    }else{
        var Selection={
            clearSelection:function(){//清空window的选择
                var r = document.selection.createRange();
                r.collapse(true);
                r.select();
            },
            setUnselectable:function(dom){
                $(dom).on("selectstart",dontStart);
            },
            setSelectable:function(dom){
                $(dom).off("selectstart",dontStart);
            },
            getRange:function(){
                var range = document.selection.createRange();
                var rangeRuler=range.duplicate();
                var node=range.parentElement();
                rangeRuler.moveToElementText(node);
                rangeRuler.collapse(true);
                
                rangeRuler.setEndPoint('EndToStart', range);
                var startOffset=rangeRuler.text.length;
                rangeRuler.setEndPoint('EndToEnd', range);
                var endOffset=rangeRuler.text.length;
                
                return{
                    startOffset:startOffset,
                    endOffset:endOffset
                };
            },
            select:function(node,start,end){
                var dest=node.childNodes[0];
                if(typeof start=="undefined"){
                    start=0;
                    end=0;
                }
                if(start==-1){
                    start=dest.length;
                }
                if(typeof end=="undefined"){
                    end=start;
                }
                var range  = document.selection.createRange();
                range.moveToElementText(node);
                range.collapse(true);
                range.moveStart('character',start);
                range.moveEnd('character',end-start);
                range.select();
            }
        }
    }
    return Selection;
});