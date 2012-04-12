kola('kola.html.Traveller', 
	['kola.lang.Object','kola.html.ElementCore','kola.lang.Array','kola.css.Selector'],
function(O,KElement,A,Selector){
    var Traveller={
        /*
            TODO:
                add()
                remove()
                first()
                last()
                index()
        */
        filter:function(selector){
            return new KElement(Selector.filter(selector,this._elements));
        },
        is:function(selector){
            return Selector.filter( selector, [this[0]] ).length > 0;
        }
    };
    var SingleTraveller={
        /**
            得到父元素
        */
        parent:function(element){
            return element.parentNode;
        },
        /**
            得到符合条件的祖先元素
        */
        parents:function(element,selector){
            var nodes=[];
            while ((element = element.parentNode) && (element.nodeType == 1)) {
                nodes.push(element);
            }
            return Selector(selector,nodes);
        },
        /**
            元素及其祖先元素中最靠近当前元素的符合条件的元素
        */
        closest:function(element,selector){
            //如果是选择器，则找到符合选择器的元素
            if(O.isString()){
                while (element.nodeType == 1) {
                    if(Selector.matchesSelector(element,selector))
                        return element;
                    element = element.parentNode
                }
            }else{//如果是数组，则从数组中找
                while (element.nodeType == 1) {
                    if(A.indexOf(selector,element))
                        return element;
                    element = element.parentNode
                }
            }
        },
        /**
            得到符合selector的子元素
        */
        children:function(element,selector){
            return Selector(selector,element.children)
        },
        /**
            得到子树上符合selector的元素
        */
        find:function(element,selector){
            return Selector(selector,element).concat(Selector(selector,[element]));
        },
        /**
		 * 拿到每一个元素的前一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
        prev:function(element){
            while ( element = element.previousSibling ) {
                if ( element.nodeType == 1 ) {
                    return element;
                }
            }
        },
        /**
		 * 拿到每一个元素的后一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
        next:function(element){
            while ( element = element.nextSibling ) {
                if ( element.nodeType == 1 ) {
                    return element;
                }
            }
        },
        /**
		 * 拿到每一个元素的第一个子节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		firstChild: function(element){
            var length = element.children.length;
            for (var j = 0; j < length; j++) {
                var child = element.children[j];
                if (!!child && child.nodeType == 1) {
                    return child;
                }
            }
		},
		/**
		 * 拿到每一个元素的最后一个子节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
		lastChild: function(element) {
            var length = element.children.length;
            for (var j = length - 1; j >= 0; j--) {
                var child = element.children[j];
                if (!!child && child.nodeType == 1) {
                    return child;
                }
            }
		},
    }
    O.each(SingleTraveller,function(name,func){
        Traveller[name]=function(selector){
            var nodes=[];
            var _this=this;
            this._each(function(element){
                var res=func.call(_this,element,selector);
                if(O.isArray(res))
                    nodes=nodes.concat(res);
                else if(res){
                    nodes.push(res);
                }
			});
            nodes=unique(nodes);
            return new KElement(nodes);
        }
    });
    /**
    数组排除重复元素
    */
	var unique=function(array){
        var flag=false;
        var le=array.length;
        for(var i=0;i<le;i++){
            for(j=i+1;j<le;j++){
                if(array[i]===array[j]){
                    array[j]=null;
                    flag=true;
                }
            }
        }
        if(flag){
            var top=0;
            for(var i=0;le;i++){
                if(array[i]!==null)
                    array[top++]=array[i];
            }
            array.splice(top,le-top);
        }
        return array;
    }
    return Traveller;
});