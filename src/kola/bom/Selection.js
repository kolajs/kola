/**
 * @author guanyuxin
 * @date 2011.10.26
 * @desc 封装浏览器的selection和range
 */
kola("kola.bom.Selection",[
    "kola.html.Element"
],function($){
    var IEStyle = !!document.all;
    //for ie
    function dontStart(){
        if(!$(event.srcElement).is("[type=text]"))
            return false;
    }
	var KolaRange = function(range, stCon, endCon, stPos, endPos){
		this.range = range;
		this.collapsed = range.collapsed;
		this.startContainer = stCon || range.startContainer;
        this.endContainer = endCon || range.endContainer;
        this.startOffset = stPos || range.startOffset;
        this.endOffset = endPos || range.endOffset;
	}
	KolaRange.prototype.collapse = function(top){
		this.range.collapse(top);
	}
    if(!IEStyle){
        KolaRange.prototype.parentElement = function(){
            var commonAncestor = this.range.commonAncestorContainer;
            if(commonAncestor.nodeType == 3)
                commonAncestor = commonAncestor.parentElement;
            return commonAncestor
        }
        KolaRange.prototype.wrappedContent = function(){
            var frag = this.range.cloneContents();
            var node = document.createElement("div");
            node.appendChild(frag);
            return node;
        }
        KolaRange.prototype.setContents = function(node){
            this.range.deleteContents();
            this.range.insertNode(node);
        }
        var Selection = {
            clearSelection:function(){//清空window的选择
                if(window.getSelection().anchorNode)
                    window.getSelection().collapseToStart();
            },
            selectable:function(dom, value){
                if(value)
                    $(dom).style("-moz-user-select", "").style("-webkit-user-select", "");
                else
                    $(dom).style("-moz-user-select", "-moz-none").style("-webkit-user-select", "none");
            },
            getRange:function(win){
                win = win || window
                var selObj = win.getSelection();
				if(selObj.rangeCount == 0)
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
            select:function(node, start, end){
                var sel = window.getSelection();
                sel.removeAllRanges();
                var range = document.createRange();
                var dest = node.childNodes[0];
                
                if(start === undefined){
                    start = 0;
                    end = 0;
                }
                if(start === -1){
                    start = dest.length;
                }
                if(end === undefined){
                    end = start;
                }
                range.setStart(dest, start);
                range.setEnd(dest, end);
                sel.addRange(range);
            }
        }
    }else{
        KolaRange.prototype.parentElement = function(){
            return this.range.parentElement();
        }
        KolaRange.prototype.wrappedContent = function(){
            return "<div>"+this.range.htmlText+"<div>";
        }
        var Selection = {
            clearSelection:function(){//清空window的选择
                var r = document.selection.createRange();
                r.collapse(true);
                r.select();
            },
            selectable:function(dom, value){
                dom.onselectstart = null;
                if(!value)
                    dom.onselectstart = dontStart;
            },
            getRange:function(win){
                win = win || window;
                var range = win.document.selection.createRange();
                var rangeRuler = range.duplicate();
                var node = range.parentElement();
                rangeRuler.moveToElementText(node);
                rangeRuler.collapse(true);
                
                rangeRuler.setEndPoint('EndToStart', range);
                var startOffset = rangeRuler.text.length;
                rangeRuler.setEndPoint('EndToEnd', range);
                var endOffset = rangeRuler.text.length;
                
                return new KolaRange(
					range,
					node,
					node,
                    startOffset,
                    endOffset
                );
            },
            select:function(node, start, end){
                var dest=node.childNodes[0];
                if(typeof start == "undefined"){
                    start = 0;
                    end = 0;
                }
                if(start == -1){
                    start=dest.length;
                }
                if(typeof end == "undefined"){
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