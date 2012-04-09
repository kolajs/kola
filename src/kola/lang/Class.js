/**
 * @fileOverview kola.lang.Class 类型支持类
 * @author Jady Yang
 * @version 2.0.0
 */

kola('kola.lang.Class',
	null,
	function() {

	/********************************************** 类定义 **********************************************/

	return {

		/**
		 * 创建一个新类，并从指定的父类继承，并设置本类的方法
		 * @param {Function} SuperClass 父类
		 * @param {Object} Methods 本类的方法列表
		 * @return 新创建的类
		 * @type Function
		 */
		/**
		 * 创建一个新类，并设置本类的方法
		 * @param {Object} Methods 本类的方法列表
		 * @param {Object} flag 默认不执行构造函数
		 * @return 新创建的类
		 * @type Function
		 */
		create: function( SuperClass, Methods ) {
			//	判断是否存在要继承的父类
			if ( typeof(Methods) == 'undefined' ) {
				Methods = SuperClass;
				SuperClass = null;
			}

			var SubClass;

			//	判断是否存在方法直接量
			var me = Methods.__ME;
			if ( me ) {
				//	存在方法直接量

				//	提供能够识别两种调用模式的方法构造体
				SubClass = function() {

					//	如果标识符不是数字，那说明类继承体系出现了问题
					var i = this.__I;
					if ( typeof( i ) != 'number' || i !== 0) {
						//	直接调用方式
						return me.apply( SubClass, arguments );
					} else {
						this.constructor = SubClass;
						this.__I = 1;
						//	这是类方式
						this._init.apply( this, arguments );
						this.__I = 4;
					}
				};
			} else {
				//	创建新类的方法
				SubClass = function() {
					this.constructor = SubClass;
					this._init.apply(this, arguments);
				};
			}
			
			//	给构造函数附加父对象的id
			SubClass._super = SuperClass || null;

			//	增加系统标识符
			SubClass.__CLASS = true;		//	标识这是个类，但是最终需要替换成类的名称

			var agencyInstance;
			if ( SuperClass == null ) {
				//	不存在父类的话
				agencyInstance = Methods;
			} else {
				//	存在父类的话，那就创建一个中间的缓冲类
				
				var AgencyClass = function() {};
				AgencyClass.prototype = SuperClass.prototype;
				agencyInstance = new AgencyClass();
				for ( var item in Methods ) {
					agencyInstance[item] = Methods[item];
				}
			}

			//	设置类实例标识符
			agencyInstance.__I = 0;

			SubClass.prototype = agencyInstance;		//	设置新类的原型
            // 拷贝类的静态方法（只有被记录在案的）
            if(SuperClass && SuperClass.__GENE){
                for(var i=0,il=SuperClass.__GENE.length;i<il;i++){
                    SubClass[SuperClass.__GENE[i]]=SuperClass[SuperClass.__GENE[i]]
                }
            }
			return SubClass;
		},

		/**
		 * 判断一个实例是否是某个类型
		 * @param object
		 * @param type
		 */
		isInstance: function( object, type ) {

			//	如果不存在要检测的实例，需要报错
			if ( !object ) {
				throw new Error( '要检测的实例不存在' );
				return;
			}

			//	判断要检测的示例是否存在构造器，不存在的话直接返回false
			var constructor = object.constructor, className;
			while ( constructor ) {

				//	如果构造器的原型中存在__CLASS属性，并且是我们要检测的类型，那就返回true
				if ( typeof( className = constructor.__CLASS) == 'string' && className === type ) return true;

				//	找到父类，继续判断
				constructor = constructor._super;
			}

			//	执行到这里，表明该实例不是指定的类型的实例
			return false;
		},
        /**
            通过修改原型链方式实现继承
            origClass：构造函数
            protoObject：原型
            protoLink：原型继承
            
            与class.create相比，对debug友好
        */
        buildProto:function(origClass,protoObject,protoLink){
            var agencyObject;
            if ( protoLink == null ) {
                agencyObject = protoObject;
            } else {
                var AgencyClass = function() {};
                AgencyClass.prototype = protoLink.prototype;
                agencyObject = new AgencyClass();
                for ( var item in protoObject ) {
                    agencyObject[item] = protoObject[item];
                }
            }
            origClass.prototype = agencyObject;
            origClass.prototype.base = protoLink;
            origClass.prototype.constructor = origClass;
        }
	};
});