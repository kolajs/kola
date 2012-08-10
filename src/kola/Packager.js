/**
 * kola是一个面向于大型、富交互Web应用的基础框架
 * 
 * @module kola
 * @main kola
 */

window.kola = (function(kola) {
	
	/**
	 * 创建一个新的空方法
	 */
	var newEmptyFunction = function() {
		return function() {};
	};
	
	/**
	 * 创建一个新的类构造器
	 */
	var newConstructor = function() {
		return function() {
			this._init.apply(this, arguments);
		};
	};
	
	/**
	 * 创建一个新的类
	 * 
	 * @param [superClass] {KolaClass} 父类
	 * @param methods {Object} 方法列表
	 * @return {KolaClass}
	 */
	var newKolaClass = function(superClass, methods) {
		// 如果只有一个输入参数，那说明没有父类
		if (arguments.length == 1) {
			methods = superClass;
			superClass = null;
		}
		
		// 建立原型对象
		var prototypeInstance;
		if (superClass === null) {
			prototypeInstance = methods;
		} else {
			// 需要建立一个中间类，用于生成一个原型对象
			var prototypeClass = newEmptyFunction();
			prototypeClass.prototype = superClass.prototype;
			prototypeInstance = new prototypeClass();
			
			// 复制方法列表到原型对象上
			for (var name in methods) {
				prototypeInstance[name] = methods[name];
			}
		}
		
		// 创建新的类
		var newClass = newConstructor();
		newClass.prototype = prototypeInstance;
		
		return newClass;
	};
	
	/**
	 * Package加载状态枚举类
	 */
	var Status = {
		uninitialized:	0,		// 未初始化
		loading:		1,		// 正在加载
		loaded:			2,		// 加载完成
		failed:			-1,		// 加载失败
		depending:		3,		// 正在加载依赖包
		interactive:	4,		// 所有直接或间接依赖包已经加载完成，处于待用状态
		complete:		5		// 完全可用
	};
	
	var Package = newKolaClass({
		
		/**
		 * 每个kola包的对应控制类
		 * 
		 * @param name {String} 包全名
		 * @param dependence {Array | Null} 依赖包，如果为null，即没有依赖包
		 * @param creator {Function} 创造包内容的方法，其返回值就是包内容
		 */
		_init: function(name, dependence, creator) {
			this._name = name;
			
			// 如果存在依赖包，那就保存，并找到无效包
			if (dependence !== null) {
				this._dependence = dependence;
				this._unavilable = findUnavilable.call(this, dependence);
			} else {
				this._dependence = null;
				this._unavilable = null;
			}
			
			this._creator = creator;
			this._entity = null;
			
			// 设置为默认状态
			this._status = Status.uninitialized;
		},
		
		/**
		 * 加载当前包
		 * 
		 * @param 
		 */
		load: function(path) {
			
		}
		
	});
	
	/**
	 * 从依赖包中找到所有还无效的包
	 */
	var findUnavilable = function(dependence) {
		// FIXME: 待写
	};
	
	/**
	 * kola的Package控制管理中心
	 */
	var Packager = {
		
		/**
		 * 定义一个包
		 * 
		 * @param name {String} 包全名
		 * @param dependence {Array | Null} 依赖包，如果为null，即没有依赖包
		 * @param creator {Function} 创造包内容的方法，其返回值就是包内容
		 */
		define: function(name, dependence, creator) {
			// FIXME: 待写
		},
		
		/**
		 * 使用某些包执行某个方法
		 * 
		 * @param packages {String | Array<String>} 要使用的包，如果是string也就是一个包的包名，如果是Array，那可能就是依赖的包列表
		 * @param callback {Function} 包可用之后的回调方法
		 */
		use: function(packages, callback) {
			// FIXME: 待写
		},
		
		/**
		 * 增量保存设置信息
		 * 
		 * @param config {Object} 增量设置对象
		 */
		config: function(config) {
			// FIXME: 待写
		}
	};
	
	//	如果存在缓存的kola方法，那就保存之
	var cachedKolaCall = !!kola && kola._cache;
	if (typeof cachedKolaCall != 'object' || cachedKolaCall == null || !cachedKolaCall.length) {
		cachedKolaCall = false;
	}
	
	/**
	 * 定义一个包
	 * 
	 * @method kola
	 * @for window
	 * @param name {String} 包名
	 * @param dependence {String | Array<String> | Null} 依赖包列表。
	 * 	如果是String类型，那就是只依赖一个包，即为依赖的包名
	 * 	如果是Array类型，那就是依赖的包列表，每项就是一个依赖包的包名
	 * 	如果为null，那就不依赖任何包
	 * @param creator {Function} 包内容生成器
	 */
	/**
	 * 使用包进行某项操作
	 * 
	 * @method kola
	 * @for window
	 * @param packages {String | Array<String>} 要使用的包列表。
	 * 	如果是String类型，那就是只使用一个包，即为包名
	 * 	如果是Array类型，那就是要使用的包列表，每项就是一个包名
	 * @param callback {Function} 要执行的方法
	 * @param [scope] {Any} 被执行方法的作用域
	 */
	/**
	 * 加载一个kola设置对象
	 * 
	 * @method kola
	 * @for window
	 * @param config {Object} 设置对象
	 */
	kola = function() {
		var args = arguments,
			scope = this;
		switch (args.length) {
			case 3:
				if (typeof args[2] == 'function') {
					// 这是定义包
					return Packager.define.apply(Packager, args);
				}
				
				// 这是使用包执行的方式
				scope = args[2];
				
			case 2:
				// 这是使用包执行的方式
				return Packager.use(args[0], args[1], scope);
			
			case 1:
				// 这是加载配置信息
				return Packager.config(args[0]);
		}
	};

	// 声明kola.Packager包
	Packager.define('kola.Packager', null, function() {
		return Packager;
	});
	
	// 如果存在之前的kola调用缓存，那就依次执行之
	if (cachedKolaCall) {
		for (var i = 0, il = cachedKolaCall.length; i < il; i++) {
			var args = cachedKolaCall[i],
				scope = cachedKolaCall.shift();
			kola.apply(scope, args);
		}
	}
	
	return kola;
	
})(window.kola);
