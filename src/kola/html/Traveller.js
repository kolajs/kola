kola('kola.html.Traveller', 
	['kola.lang.Object','kola.html.ElementCore','kola.lang.Array','kola.lang.Type','kola.css.Selector'],
function(O,KElement,A,Type,Selector){
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
            return new KElement(Selector(selector,this._elements));
        },
        is:function(){
            return new Selector(selector,[this[0]]).length!=0;
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
            while ((element = element.parentNode) && (element.nodeType == 1)) {
                if(Selector(selector,[element]).length==1)
                    return element;
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
                if(Type.isArray(res))
                    nodes=nodes.concat(res);
                else if(res){
                    nodes.push(res);
                }
			});
            return new KElement(A.unique(nodes));
        }
    });
    return Traveller;
});