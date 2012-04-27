/**
 * @fileOverview kola.html.ElementCore dom元素的封装 
 * @author Jady Yang Yuxin Guan
 * @version 2.0.0
 */
kola('kola.html.ElementCore', 
	['kola.lang.Class','kola.lang.Object','kola.event.Dispatcher','kola.css.Selector'],
function(C, O, Dispatcher, Selector){
    /**
        用于element.data的存储
    */
    var cache={};
    var cache_attr_name="kola" + new Date().getTime();
    var cacheSize=1;
    
    var ElementCore=C.create(Dispatcher,{
        __ME:function(selector, context){
            if(O.isString(selector) && selector.charAt(0)!='<'){
                //	如果为css selector
                var nodes;

                //	确认是否存在context
                if(O.isUndefined(context)){
                    context=null;
                }else{
                    context=ElementCore.util.toElements(context);
                    if(context.length==0)
                        context=null;
                }
                //	根据有无context进行不同的处理
                if (context === null) {
                    nodes = Selector(selector);
                } else {
                    //	context为数组，需要在每个context中寻找
                    //	TODO: 这里是有问题的，因为如果selector就是获取第一个，或者指定的某个
                    nodes = [];
                    for (var i = 0, il = context.length; i < il; i ++) {
                        nodes = nodes.concat(Selector(selector, context[i]));
                    }
                }
                return new this(nodes);
            }else{
                var nodes=ElementCore.util.toElements(selector);
            }
            return new this(nodes);
        },
        _init:function(elements){
            this.length=elements.length;
            for(var i=0;i<this.length;i++)
                this[i]=elements[i];
            this._elements = elements;
        },
        /*-------------------------------------- data相关 --------------------------------------*/
        /**
            得到第0个元素的data[name]
            或者设置所有元素的data[name]
        */
        data:function(name,data){
            if(O.isUndefined(data)){
                index=this[0][cache_attr_name];
                if(!index || !cache[index])
                    return null;
                return cache[index][name];
            }else{
                this._each(function(e){
                    index=e[cache_attr_name];
                    if(!index){
                        index=cacheSize++;
                        e[cache_attr_name]=index;
                    }
                    if(!cache[index])
                        cache[index]={};
                    cache[index][name]=data;
                })
            }
        },
        /**
            移除所有元素的data[name]
        */
        removeData:function(name){
            this._each(function(e){
                index=e[cache_attr_name];
                if(!index || !cache[index])
                    return;
                cache[index][name]=null;
            });
        },
        /**
            移除所有元素的所有data
        */
        removeAllData:function(){
            this._each(function(e){
                index=e[cache_attr_name];
                if(!index)
                    return;
                cache[index]=null;
            });
        },
		/*-------------------------------------- 数组相关 --------------------------------------*/
		elements: function(){
            return this._elements;
        },
        /**
		 * 迭代处理每一个元素
		 */
		each: function( fn ) {
			//	使用迭代器循环每个元素
			for ( var i = 0, il = this.length; i < il; i++ ) {
				fn.call( this, this.constructor( this[i] ), i );
			}
			return this;
		},
        /*-------------------------------------- KolaElement内部函数 --------------------------------------*/
        /**
        简单each
        */
        _each:function(callBack){
            for(var i=0,il=this.length;i<il;i++)
                callBack.call(this,this[i]);
        },
        //使得浏览器认为实例是一个数组，方便调试
        length:0,
        splice:[].splice
    });
    
    /**
	* 将驼峰式转换为css写法
	*/
	function hyphenate(name) {
		return name.replace(/[A-Z]/g, function(match) {
			return '-' + match.toLowerCase();
		});
	}
    ElementCore.expando=cache_attr_name;
    ElementCore.util={
        /**
         * 获取样式属性
         * @param element
         * @param name
         */
        getComputedStyle : function( element, name ) {
            if (window.getComputedStyle) {
                return window.getComputedStyle(element, null).getPropertyValue(hyphenate(name));
            }
            if (document.defaultView && document.defaultView.getComputedStyle) {
                var computedStyle = document.defaultView.getComputedStyle(element, null);
                if (computedStyle) return computedStyle.getPropertyValue(hyphenate(name));
                if (name == "display") return "none";
            }
            if (element.currentStyle) {
                return element.currentStyle[name];
            }
            return element.style[name];
        },
        /**
        得到元素数组
            Array[element] :不变
            element：[element]
            kolaElement:kolaElement的_elements
            String(html):转换成element
        */
        toElements : function(selector){
            if(O.isArray(selector)){
                return selector;
            }
            if(O.isString(selector)){
                //	如果为html
                var ctr = document.createElement('div');
                ctr.innerHTML = selector;
                var arr=[];
                for(var i=ctr.children.length-1;i>=0;i--){
                    arr[i]=ctr.children[i];
                }
                ElementCore.fire({type:"DOMNodeInserted",data:arr});
                return arr;
            }
            // 如果是window
            if(selector==window)
                return [selector];
            //	如果为kola.html.Element
            if ( selector instanceof ElementCore )
                return selector.elements();
            //	如果为HTMLCollection的话，那就返回之
            if (!O.isUndefined(selector.length)) {
            	var array = [];
            	for (var i = 0, il = selector.length; i < il; i++) {
                    if(selector[i].nodeType === 1)
                        array.push(selector[i]);
            	}
            	return array;
            }
            //	如果为DOMLElement
            if (selector.nodeType === 1) 
                return [selector];
            if(selector.nodeType === 9){
                if(selector.documentElement)
                    selector=selector.documentElement;
                return [selector];
            }

        }
    };
    return ElementCore;
});