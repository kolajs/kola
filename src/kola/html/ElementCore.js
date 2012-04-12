/**
 * @fileOverview kola.html.ElementCore domԪ�صķ�װ
 * @author Jady Yang Yuxin Guan
 * @version 2.0.0
 */
kola('kola.html.ElementCore', 
	['kola.lang.Class','kola.lang.Object','kola.event.Dispatcher','kola.css.Selector'],
function(C, O, Dispatcher, Selector){
    /**
        ����element.data�Ĵ洢
    */
    var cache={};
    var cache_attr_name="kola" + new Date().getTime();
    var cacheSize=1;
    
    var ElementCore=C.create(Dispatcher,{
        __ME:function(selector, context){
            if(O.isString(selector) && selector.charAt(0)!='<'){
                //	���Ϊcss selector
                var nodes;

                //	ȷ���Ƿ����context
                if(O.isUndefined(context)){
                    context=null;
                }else{
                    context=ElementCore.util.toElements(context);
                    if(context.length==0)
                        context=null;
                }
                //	�������context���в�ͬ�Ĵ���
                if (context === null) {
                    nodes = Selector(selector);
                } else {
                    //	contextΪ���飬��Ҫ��ÿ��context��Ѱ��
                    //	TODO: ������������ģ���Ϊ���selector���ǻ�ȡ��һ��������ָ����ĳ��
                    nodes = [];
                    for (var i = 0, il = context.length; i < il; i ++) {
                        nodes = nodes.concat(Selector(selector, context[i]));
                    }
                }
                return new this(nodes);
            }else{
                var nodes=ElementCore.util.toElements(selector);
            }
            if(nodes)
                return new this(nodes);
            return null;
        },
        _init:function(elements){
            this.length=elements.length;
            for(var i=0;i<this.length;i++)
                this[i]=elements[i];
            this._elements = elements;
        },
        /*-------------------------------------- data��� --------------------------------------*/
        /**
            �õ���0��Ԫ�ص�data[name]
            ������������Ԫ�ص�data[name]
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
            �Ƴ�����Ԫ�ص�data[name]
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
            �Ƴ�����Ԫ�ص�����data
        */
        removeAllData:function(){
            this._each(function(e){
                index=e[cache_attr_name];
                if(!index)
                    return;
                cache[index]=null;
            });
        },
		/*-------------------------------------- ������� --------------------------------------*/
		elements: function(){
            return this._elements;
        },
        /**
		 * �����ÿһ��Ԫ��
		 */
		each: function( fn ) {
			//	ʹ�õ����ѭ��ÿ��Ԫ��
			for ( var i = 0, il = this.length; i < il; i++ ) {
				fn.call( this, this.constructor( this[i] ), i );
			}
			return this;
		},
        /*-------------------------------------- KolaElement�ڲ����� --------------------------------------*/
        /**
        ��each
        */
        _each:function(callBack){
            for(var i=0,il=this.length;i<il;i++)
                callBack.call(this,this[i]);
        },
        //ʹ���������Ϊʵ����һ�����飬�������
        length:0,
        splice:[].splice
    });
    
    /**
	* ���շ�ʽת��Ϊcssд��
	*/
	function hyphenate(name) {
		return name.replace(/[A-Z]/g, function(match) {
			return '-' + match.toLowerCase();
		});
	}
    ElementCore.expando=cache_attr_name;
    ElementCore.util={
        /**
         * ��ȡ��ʽ����
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
        �õ�Ԫ������
            Array[element] :����
            element��[element]
            kolaElement:kolaElement��_elements
            String(html):ת����element
        */
        toElements : function(selector){
            if(O.isArray(selector)){
                return selector;
            }
            if(O.isString(selector)){
                //	���Ϊhtml
                var ctr = document.createElement('div');
                ctr.innerHTML = selector;
                var arr=[];
                for(var i=ctr.children.length-1;i>=0;i--){
                    arr[i]=ctr.children[i];
                }
                ElementCore.fire({type:"ElementCreate",data:arr});
                return arr;
            }
            //	���Ϊkola.html.Element
            if ( selector instanceof ElementCore )
                return selector.elements();
            //	���ΪDOMLElement
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