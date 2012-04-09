/**
 * @fileOverview kola.lang.Object Object类
 * @author flyhuang
 * @version 2.0.0
 */


kola('kola.lang.Object', 
	null, 
	function() {
	
	/********************************************** 类定义 **********************************************/
	
	var obj= {
		
		/**
		 * 对象的属性继承
		 * @param {deep} 是否需要深度拷贝，可选项
		 * @param {target} 目标对象
		 * @param {src} 源对象
		 * @return 目标对象
		 * @type Function
		 */
		extend: function() {

                var options, name, src, copy, copyIsArray, clone,
                    target = arguments[0] || {},
                    i = 1,
                    length = arguments.length,
                    deep = false;
            
                //是否需要深度复制对象
                if ( typeof target === "boolean" ) {
                    deep = target;
                    target = arguments[1] || {};
                    i = 2;
                }
            
                if ( typeof target !== "object" && !this.isFunction(target) ) {
                    target = {};
                }
            
                if ( length === i ) {
                    target = {};
                    --i;
                }
            
                for ( ; i < length; i++ ) {
                    if ( (options = arguments[ i ]) != null ) {
                        for ( name in options ) {
                            src = target[ name ];
                            copy = options[ name ];

                            if ( target === copy ) {
                                continue;
                            }
            
                            if ( deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)) ) ) {
                                if ( copyIsArray ) {
                                    copyIsArray = false;
                                    clone = src && this.isArray(src) ? src : [];
            
                                } else {
                                    clone = src && this.isPlainObject(src) ? src : {};
                                }
                                target[ name ] = this.extend( deep, clone, copy );
                            } else if ( copy !== undefined ) {
                                target[ name ] = copy;
                            }
                        }
                    }
                }
            
                return target;
        },
		/**
		 * 对象的属性拷贝
		 * @param {obj} 目标对象
		 * @param {options} 源对象
		 * @return 目标对象
		 * @type object
		 */
        clone: function(obj) {
            var n = {};  
            for (var it in obj) {
                n[it] = obj[it];
            }
            return n;
        },
        /**
         * 对象的迭代处理
         * @param {obj} 目标对象
         * @param {options} 源对象
         * @return 目标对象
         * @type object
         */
        each : function(object, callback, args) {
            var name, i = 0,
            length = object.length,
            isObj = length === undefined || this.isFunction(object);

            if ( args ) {
                if ( isObj ) {
                    for ( name in object ) {
                        if ( callback.apply( object[ name ], args ) === false ) {
                            break;
                        }
                    }
                } else {
                    for ( ; i < length; ) {
                        if ( callback.apply( object[ i++ ], args ) === false ) {
                            break;
                        }
                    }
                }
            } else {
                if ( isObj ) {
                    for ( name in object ) {
                        if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                            break;
                        }
                    }
                } else {
                    for ( var value = object[0];
                        i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
                }
            }

            return object;
            },
        /*
         *@brief 判断是否是一个原生对象而不是由构造函数派生的对象
         */
        isPlainObject: function( obj ) {
            if ( !obj || this.type(obj) !== "object" || obj.nodeType || this.isWindow( obj ) ) {
                return false;
            }

            if ( obj.constructor &&
                !this.hasOwn.call(obj, "constructor") &&
                !this.hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
                return false;
            }

            var key;
            for ( key in obj ) {}

            return key === undefined || this.hasOwn.call( obj, key );
        },		
        //判断是否window对象
        isWindow: function( obj ) {
            return obj && typeof obj === "object" && "setInterval" in obj;
        },
        /*
         *@brief 缓存原生对象
         */
        toString :Object.prototype.toString,
        hasOwn : Object.prototype.hasOwnProperty
        
    };
	
	return obj;
	
});