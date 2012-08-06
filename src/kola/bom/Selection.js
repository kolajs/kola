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
	function KolaRange(range,stCon,endCon,stPos,endPos){
		this.range = range;
		this.collapsed = range.collapsed;
		this.startContainer = stCon||range.startContainer;
        this.endContainer = endCon||range.endContainer;
        this.startOffset = stPos||range.startOffset;
        this.endOffset = endPos||range.endOffset;
	}
	KolaRange.prototype.collapse=function(top){
		this.range.collapse(top);
	}
	KolaRange.prototype.parentElement=function(){
		if(Browser.IEStyle){
			return this.range.parentElement();
		}else{
			var commonAncestor=this.range.commonAncestorContainer;
			if(commonAncestor.nodeType == 3)
				commonAncestor=commonAncestor.parentElement;
			return commonAncestor
		}
	}
	KolaRange.prototype.wrappedContent=function(){
		if(Browser.IEStyle){
			return "<div>"+this.range.htmlText+"<div>";
		}else{
			var frag=this.range.cloneContents();
			var node=document.createElement("div");
			node.appendChild(frag);
			return node;
		}
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
				if(selObj.rangeCount==0)
					return null;
                var range  = selObj.getRangeAt(0);
                /*
                if(range.startContainer.nodeType!=3){//如果是textarea的select
                    var dom=range.startContainer.childNodes[range.startOffset];
                    return new KolaRange(
						range,
                        dom,
                        dom,
                        dom.selectionStart,
                        dom.selectionEnd
					)
                }*/
                return new KolaRange(range);
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
                
                return new KolaRange(
					range,
					node,
					node,
                    startOffset,
                    endOffset
                );
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