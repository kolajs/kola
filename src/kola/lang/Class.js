/**
 * kola language 包，提供JS语言中常见数据类型的常用方法
 * 
 * @module kola.lang
 */

kola('kola.lang.Class', [
], function () {

	/********************************************** 类定义 **********************************************/

	/**
	 * kola的Class类，用于类的创建和检测等
	 * 
	 * @class Class
	 * @static
	 * 
	 * @author Jady Yang
	 */
	 /**
	 * 创建一个新类，并从指定的父类继承，并设置本类的方法
	 * 
	 * @method create
	 * @param [SuperClass] {Function} 父类
	 * @param Methods {Object} 本类的方法列表
	 * @return {Function} 新创建的类
	 */
	var exports = function (SuperClass, Methods) {
		//	判断是否存在要继承的父类
		if (arguments.length == 1) {
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
				if (!this._init) {
					this._init = function(){};
				} else {
					this._init.apply( this, arguments );
				}
			};
		}
		
		//	给构造函数附加父对象的id
		SubClass._super = SuperClass || null;

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
	};
	/**
	 * 测试对象是否为函数
	 * @method isFunction
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isFunction = function (target) {
		return (eye.call(target) == "[object Function]");
	};

	/**
	 * 测试对象是否为函数
	 * @method isArray
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isArray = function (target) {
		return (eye.call(target) == "[object Array]");
	};
	/*
	 * 测试对象是否为对象
	 * @method isObject
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isObject = function (target) {
		return (eye.call(target) == "[object Object]");
	};
	/**
	 * 测试对象是否为字符串
	 * @method isString
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isString = function (target) {
		return (eye.call(target) == "[object String]");
	};

	/**
	 * 测试对象是否为正则表达式
	 * @method isRegExp
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isRegExp = function (target) {
		return (eye.call(target) == "[object RegExp]");
	};

	/**
	 * 测试对象是否为数字
	 * @method isNumber
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isNumber = function (target) {
		return (eye.call(target) == "[object Number]");
	};

	/**
	 * 测试对象是否未定义
	 * @method isUndefined
	 * @param target {Object} 目标对象
	 * @return {Boolean}
	 */
	exports.isUndefined = function (target) {
		return (typeof target=="undefined");
	};

	/**
	 * 测试对象类型的函数
	 * @property eye
	 * @type {Function}
	 * @private
	 */
	var eye = Object.prototype.toString;
	
	return exports;
});