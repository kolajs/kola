/**
 * kola是一个面向于大型、富交互Web应用的基础框架
 * 
 * @module kola
 * @main kola
 */

window.kola = (function(kola) {
	
	/*********************************************************************
	 *                        辅助方法
	 ********************************************************************/
	
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
	
	/*********************************************************************
	 *                        PackageStatus类
	 ********************************************************************/
	
	/**
	 * Package加载状态枚举类
	 */
	var PackageStatus = {
		uninitialized:	0,		// 未初始化
		loading:		1,		// 正在加载
		loaded:			2,		// 加载完成
		failed:			-1,		// 加载失败
		depending:		3,		// 正在加载依赖包
		interactive:	4,		// 所有直接或间接依赖包已经加载完成，处于待用状态
		complete:		5		// 完全可用
	};
	
	/*********************************************************************
	 *                        Package类
	 ********************************************************************/
	
	var Package = newKolaClass({
		
		/**
		 * 每个kola包的对应控制类
		 * 
		 * @param name {String} 包全名
		 * @param [creator] {Function} 创造包内容的方法，其返回值就是包内容
		 * @param [dependence] {Array | Null} 依赖包，如果为null，即没有依赖包
		 */
		_init: function(name, creator, dependence) {
			this._name = name;
			
			// 设置为默认状态
			this._status = PackageStatus.uninitialized;
			
			switch (arguments.length) {
				case 3:
					// 保存dependence
					if (dependence !== null) {
						this._dependence = dependence;
						this._unavilable = findUnavilable.call(this, dependence);
					} else {
						this._dependence = null;
						this._unavilable = null;
					}
					
				case 2:
					// 保存creator
					this._creator = creator;
					this._entity = null;
					break;
				
			}
		},
		
		/**
		 * 加载当前包
		 * 
		 * @param path {String} 加载地址
		 */
		load: function(path) {
			// FIXME: 待写
		},
		
		/**
		 * 当前包已经加载成功，并设置依赖包信息
		 * 
		 * @param dependence {Array<String> | Null} 依赖包的列表
		 */
		loaded: function(dependence) {
			// FIXME: 待写
		},
		
		/**
		 * 需要将当前包置为完成状态，并在完成后回调指定的方法
		 * 
		 * @param callback {Function} 包可用后的回调方法
		 */
		complete: function(callback) {
			// FIXME: 待写
		},
		
		/**
		 * 获取包的状态
		 * 
		 * @return {Number}
		 */
		/**
		 * 设置包的状态
		 * 
		 * @param status {Number} 包的新状态码
		 * @chainable
		 */
		status: function(status) {
			// FIXME: 待写
		}
		
	});
	
	/**
	 * 从依赖包中找到所有还无效的包
	 */
	var findUnavilable = function(dependence) {
		// FIXME: 待写
	};
	
	/*********************************************************************
	 *                        Packager类
	 ********************************************************************/
	
	/**
	 * kola的Package控制管理中心
	 * 
	 * @class Packager
	 * @static
	 */
	var Packager = {
		
		/**
		 * 定义一个包
		 * 
		 * @method define
		 * @param name {String} 包全名
		 * @param dependence {Array<String> | Null | String} 依赖包列表
		 * 	如果为null，即没有依赖包；
		 * 	如果为String类型，说明只有一个依赖包
		 * 	如果是Array类型，那就是依赖包的列表
		 * @param creator {Function} 创造包内容的方法，其返回值就是包内容
		 * @chainable
		 */
		define: function(name, dependence, creator) {
			// 如果包早已加载完成，那则不做处理
			var packageObj = packageObjects[name] 
				|| (packageObjects[name] = new Package(name, creator));	// 或新建之
			if (packageObj.status() >= PackageStatus.loaded) return;
			
			// 把dependence转化为数组或者字符串
			switch (typeof dependence) {
				case 'string':
					// 一个依赖包
					dependence = [dependence];
					break;
				case 'object':
					if (dependence.length) {
						// 一个或多个依赖包
						break;
					}
				default:
					// 没有依赖包
					dependence = null;
			}
			
			// 设置当前包加载成功
			packageObj.loaded(dependence);
			
			return Packager;
		},
		
		/**
		 * 使用某些包执行某个方法
		 * 
		 * @method use
		 * @param packages {String | Array<String>} 要使用的包，如果是string也就是一个包的包名，如果是Array，那可能就是依赖的包列表
		 * @param callback {Function} 包可用之后的回调方法
		 * @chainable
		 */
		use: function(packages, callback) {
			// packages都变成数组格式
			packages = typeof packages == 'string' ? [packages] : packages.concat();
			var unavilable = packages.concat();	// 无效的包列表
			
			// 创建一个完成后的回调方法
			var completeListener = createPackageCompleteListener(packages, unavilable, callback);
			
			// 循环每个依赖包，监听其complete事件
			for (var i = 0, il = packages.length; i < il; i++) {
				var packageObj = packageObjects[name] 
					|| (packageObjects[name] = new Package(packages[i]));	// 或新建之
				packageObj.complete(completeListener);
			}
			
			return Packager;
		},
		
		/**
		 * 增量保存设置信息
		 * 
		 * @method config
		 * @param config {Object} 增量设置对象
		 * @chainable
		 */
		config: function(config) {
			objectExtend(config, packagerConfig);
			
			return Packager;
		}
	};
	
	/**
	 * 深度复制对象
	 */
	var objectExtend = function(fromObject, toObject) {
		for (var name in fromObject) {
			var value = fromObject[name];
			
			switch (typeof value) {
				case 'funtion': 
					break;
				
				case 'object':
					if (value !== null) {
						// 对于map对象进行深度复制
						// 注意：这里没有判断是否为数组，因为配置参数中不会出现这种情景
						objectExtend(value, (toObject[name] = {}));
						break;
					}
				
				default:
					// 剩下的都是值类型，直接复制
					toObject[name] = value;
			}
		}
	};
	
	/**
	 * packager的配置信息
	 * 
	 * @property packagerConfig
	 * @type {Object}
	 * @private
	 * @for Packager
	 */
	var packagerConfig = {};
	
	/**
	 * 保存所有包的对应控制对象。这是个Map格式的对象，键值为包的全名称，值为对应的封装对象
	 * 
	 * @property packageObjects
	 * @type {Object}
	 * @private
	 * @for Packager
	 */
	var packageObjects = {};
	
	/**
	 * 创建一个确保所有需要的包都加载完成就能执行相应回调方法的事件监听器
	 * 
	 * @method createPackageCompleteListener
	 * @private
	 * @for Packager
	 * @param usedPackages {Array<String>} 需要的包名列表
	 * @param callback {Function} 包都加载完成后的回调方法
	 * @param unavilableCount {Number} 无效包的数量
	 * @return {Function} 生成的事件监听器方法，其输入参数只有一个，为加载成功的包名称
	 */
	var createPackageCompleteListener = function(usedPackages, callback, unavilableCount) {
		return function(name) {
			if (--unavilableCount <= 0) {
				// 需要的包全部加载完成，可以执行了回调方法了
				// FIXME: 待写
			}
		};
	};
	
	/*********************************************************************
	 *                         kola方法定义
	 ********************************************************************/
	
	//	如果存在缓存的kola方法，那就保存之
	var cachedKolaCall = !!kola && kola._cache;
	
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
	if (typeof cachedKolaCall == 'object' 
		&& cachedKolaCall != null 
		&& cachedKolaCall.length
	) {
		for (var i = 0, il = cachedKolaCall.length; i < il; i++) {
			var args = cachedKolaCall[i],
				scope = cachedKolaCall.shift();
			kola.apply(scope, args);
		}
	}
	
	return kola;
	
})(window.kola);
