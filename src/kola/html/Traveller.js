kola('kola.html.Traveller', 
	['kola.lang.Object','kola.html.ElementCore','kola.lang.Array','kola.css.Selector'],
function(O,KElement,A,Selector){
    var Traveller={
        /*
            TODO:
                
                remove()
                first()
                last()
                index()
        */
        /**
            给element增加一些元素
            @param sets string,element,kolaElement
        */
        add:function(sets){
            var elements=KElement.util.toElements(sets);
            for(var i=0,il=elements.length;i<il;i++){
                for(var j=0,jl=this.length;j<jl;j++){
                    if(this[j]==elements[i])
                        break;
                }
                if(j==jl){
                    this[this.length]=elements[i];
                    this._elements[this.length]=elements[i];
                    this.length++;
                }
            }
            return this;
        },
        /**
            给element排除一些元素
            @param sets element,kolaElement
        */
        not:function(sets){
            var elements=KElement.util.toElements(sets);
            for(var i=0,il=elements.length;i<il;i++){
                for(var j=0,jl=this.length;j<jl;j++){
                    if(this[j]==elements[i]){
                        this.splice(j,1);
                        this._elements.splice(j,1);
                    }
                }
            }
            return this;
        },
        index:function(selector){
            var elem=this[0];
            if(!elem)
                return -1;
            if(selector)
                return A.indexOf(KElement(elem.parentNode).children(selector),elem);
            else
                return A.indexOf(elem.parentNode.children,elem);
        },
        filter:function(selector){
            return new KElement(Selector.filter(selector,this._elements));
        },
        is:function(selector){
            if(this.length==0)
                return false;
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
            if(O.isString(selector)){
                while (element.nodeType == 1) {
                    if(Selector.matchesSelector(element,selector))
                        return element;
                    element = element.parentNode
                }
            }else{//如果是数组，则从数组中找
                while (element.nodeType == 1) {
                    if(A.indexOf(selector,element)!=-1)
                        return element;
                    element = element.parentNode
                }
            }
        },
        /**
            得到符合selector的子元素
        */
        children:function(element, selector){
            var c=[];
            for(var i=0;i<element.children.length;i++)
                c[i]=element.children[i];
            return Selector.filter(selector,c);
        },
        /**
            得到改dom上符合selector的元素
        */
        find:function(element, selector){
            return Selector(selector,element).concat(Selector.filter(selector,[element]));
        },
        /**
            得到子树上符合selector的元素
        */
        decendent:function(element, selector){
            return Selector(selector,element);
        },
        /**
		 * 拿到每一个元素的前一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
        prev:function(element, selector){
            while ( element = element.previousSibling ) {
                if ( element.nodeType == 1 ) {
                    if(!selector || Selector.matchesSelector(element,selector))
                        return element;
                }
            }
        },
        /**
		 * 拿到每一个元素的后一个兄弟节点
		 * @return 包含了所有节点的Element对象
		 * @type kola.html.Element
		 */
        next:function(element, selector){
            while ( element = element.nextSibling ) {
                if ( element.nodeType == 1 ) {
                    if(!selector || Selector.matchesSelector(element,selector))
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
		}
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