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
	 * 给方法绑定一个作用域
	 */
	var bindScope = function(fn, scope) {
		return function() {
			fn.apply(scope, arguments);
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
		 */
		_init: function(name) {
			this._name = name;
			
			// 设置为默认状态
			this._status = PackageStatus.uninitialized;
		},
		
		/**
		 * 加载当前包
		 * 
		 * @chainable
		 */
		load: function() {
			// 获取路径信息
			var path = Packager.path(this._name);
			
			// 创建用于加载的script节点，并设置相关信息
			var script = document.createElement('script');
			script.src = path.uri;
			if (path.charset) {
				script.charset = path.charset;
			}
			
			// FIXME: 跟踪error事件，用于发现链接错误或包名笔误的包
			script.onerror = bindScope(loadError, this);
			
			// FIXME: 跟踪加载完成事件，用于发现包执行错误或者期望与实际包名不同的包
			
			// 设置加载状态为加载中
			this.status(PackageStatus.loading);
			
			// 开始加载
			document.body.appendChild(script);
			
			return this;
		},
		
		/**
		 * 当前包已经加载成功，并设置依赖包信息
		 * 
		 * @param creator {Function} 包内容生成器
		 * @param dependence {Array<String> | Null} 依赖包的列表
		 */
		loaded: function(creator, dependence) {
			this._creator = creator;
			if (dependence !== null) {
				this._dependence = dependence;
			}
			
			// 设置为加载完成状态
			this.status(PackageStatus.loaded);
			
			// 加载完成后的，需要考虑是否自动加载依赖项
			if (this._wanted) {
				depending.call(this);
			}
		},
		
		/**
		 * 当包处于可用状态时，回调该方法
		 * 
		 * @param callback {Function} 包可用后的回调方法
		 * @chainable
		 */
		complete: function(callback) {
			// 这是监听包的可用状态
			this._wanted = true;
			
			// 把可用后的回调方法放到排队表中
			(this._demander || (this._demander = [])).push(callback);
			
			// 根据不同的状态，执行不同的操作
			switch (this._status) {
				
				// 如果是未初始化状态，那就需要开始加载
				case PackageStatus.unavilable:
					this.load();
					break;
				
				// 如果处于加载完成状态，那就开始加载依赖包
				case PackageStatus.loaded:
					depending.call(this);
					break;
				
				// 如果处于可用状态，那就在下一个队列中执行之
				case PackageStatus.complete:
					fireComplete.call(this);
					break;
				
				// 其他状态（加载中、待用）则无需其他处理
			}
			
			return this;
		},
		
		/**
		 * 获取包的实体内容
		 * 
		 * @return {Any}
		 */
		entity: function() {
			return this._creator;
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
			if (arguments.length == 0) {
				// 获取状态
				return this._status;
			} else {
				// 设置状态
				this._status = status;
				
				return this;
			}
		}
		
	});
	
	/**
	 * 开始加载依赖包
	 * 
	 * @private
	 * @chainable
	 */
	var depending = function() {
		var dependence = this._dependence;
		if (dependence) {
			// 如果有依赖包，那就加载之
			Packager.use(dependence, toComplete, this);
		} else {
			// 没有依赖包，那就直接进入可用状态
			toComplete.call(this);
		}
	};
	
	/**
	 * 设置当前包为可用状态
	 * 
	 * @param [package]* {Any} 依赖包
	 * @return {Function} 生成的可用回调方法
	 */
	var toComplete = function() {
		// 设置当前包为完成状态
				
		// 获取包的实体内容
		this._creator = this._creator.apply(window, arguments);
		
		// 设置状态为完成状态
		this.status(PackageStatus.complete);
		
		// 触发complete事件
		fireComplete.call(this);
		
		// 清除不必要的属性
		delete this._dependence;
		delete this._wanted;
		
		return this;
	};
	
	/**
	 * 触发complete事件
	 */
	var fireComplete = function() {
		// 如果有等待者的话，那就通知之
		var demander = this._demander,
			name = this._name;
		if (demander) {
			// 循环每个回调，依次执行之
			var callback;
			while (callback = demander.shift()) {
				callback(name);
			}
			
			// 清除
			delete this._demander;
		}
		
		return this;
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
			var packageObj = Packager._package(name);
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
			packageObj.loaded(creator, dependence);
			
			return Packager;
		},
		
		/**
		 * 使用某些包执行某个方法
		 * 
		 * @method use
		 * @param packages {String | Array<String>} 要使用的包，如果是string也就是一个包的包名，如果是Array，那可能就是依赖的包列表
		 * @param callback {Function} 包可用之后的回调方法
		 * @param [scope] {Any} 回调方法的作用域
		 * @chainable
		 */
		use: function(packages, callback, scope) {
			// packages都变成数组格式
			packages = typeof packages == 'string' ? [packages] : packages.concat();
			packages.unavilable = packages.length;	// 无效包的个数
			
			// 创建一个完成后的回调方法
			var completeListener = createPackageCompleteListener(packages, callback, scope);
			
			// 循环每个依赖包，监听其complete事件
			for (var i = 0, il = packages.length; i < il; i++) {
				Packager._package(packages[i]).complete(completeListener);
			}
			
			return Packager;
		},
		
		/**
		 * 增量保存设置信息
		 * 
		 * @method config
		 * @param config {Object} 增量设置对象
		 * @chainable
		 * 
		 * @example
		 * 	{
		 * 		charset: 'utf-8',			// 编码，默认没有
		 * 		path: '/…/',				// 跟路径，默认自动寻找当前的
		 * 		domReady: true,				// 要执行的方法默认都在domReady之后执行，默认为true
		 * 
		 * 		// lib配置，优先级高于全局配置，但是低于packages
		 * 		libs: {                     // lib列表
		 * 			'kola': {				// kola lib的定义
		 * 				charset: 'utf-8',	// 编码，默认使用全局配置
		 * 				path: '...'			// 根路径，默认使用全局配置
		 * 			},
		 * 			'kola.ui': {			// kola.ui lib的定义
		 * 				charset: 'gbk',		// 编码，默认使用全局配置
		 * 				path: '...'			// 根路径，默认使用全局配置
		 * 			},
		 * 			'webbricks.clay': {		/ webbricks.clay lib的定义
		 * 				charset: 'gbk',		// 编码，默认使用全局配置
		 * 				path: '...'			// 根路径，默认使用全局配置
		 * 			}
		 * 		},
		 * 
		 * 		// package配置，编码采用全局配置，优先级高于libs
		 * 		packages: {
		 * 			'kola.lang.Class': 0,	// 如果是数字，代表要去uris数组上获取最终地址
		 * 			'kola.net.Ajax', 0,
		 * 			'kola.lang': 1,			// 这个代表所有kola.lang下的包，都在这个地址上
		 * 			'webbricks.magicbox': 'http://.../magicbox.js'
		 * 		},
		 * 
		 * 		// 可用地址列表
		 * 		uris: [
		 * 			'http://.../common.js',
		 * 			'http://.../index.js'
		 * 		]
		 * 	}
		 */
		config: function(config) {
			objectExtend(config, packagerConfig);
			
			return Packager;
		},
		
		/**
		 * 获取一个包的路径配置信息
		 * 
		 * @method path
		 * @param name {String} package名称
		 * @return {Object} 路径信息，有这些属性：
		 * 	uri，文件路径地址；
		 * 	charset，文件编码，没有的话那就是不设定编码；
		 */
		path: function(name) {
			var names = name;
			
			// FIXME: 现在packages配置项上查找
			
			// 在libs上查找
			var libs = packagerConfig.libs;
			for (var il = names.length - 1, i = il - 1; i >= 0; i--) {
				var config = libs[names.slice(0, i).join('.')];
				if (config) {
					config = objectExtend(config, {});
					config.uri = config.path 
						+ names.slice(i + 1, il).join('/') 
						+ '.js';
						
					delete config.path;
					return config;
				}
			}
			
			// 按照全局配置生成地址
			var path = packagerConfig.path;
			if (typeof path != 'string') {
				// 没有默认的路径配置信息，那就查找所有script节点，自动匹配确认
				var scripts = document.getElementsByTagName('script');
				for (var i = 0, il = scripts.length; i < il; i++) {
					var src = scripts[i].src;
					if (!src) continue;
					
					src = src.toLowerCase();
					
					// 首先判断是否存在packager
					var index = src.indexOf('packager');
					if (index == -1) continue;
					
					// 判断上一级是否存在kola
					index = src.lastIndexOf('kola', src.length - index);
					if (index == -1) continue;
					
					// 找到kola之前的/，这就是path
					path = packagerConfig.path = src.substr(0, src.lastIndexOf('/', src.length - index) + 1);
				}
			}
			if (path) {
				return path + names.join('/') + '.js';
			}
			
			// FIXME: 没有找到路径信息，抛出错误
		},
		
		/**
		 * 获取某个package的控制对象
		 * 
		 * @method _package
		 * @protected
		 * @param name {String} package名称
		 */
		_package: function(name) {
			// 没有该package那就创建之
			return packageObjects[name] || (packageObjects[name] = new Package(name));
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
						toObject[name] = objectExtend(value, {});
						break;
					}
				
				default:
					// 剩下的都是值类型，直接复制
					toObject[name] = value;
			}
		}
		return toObject;
	};
	
	/**
	 * packager的配置信息
	 * 
	 * @property packagerConfig
	 * @type {Object}
	 * @private
	 * @for Packager
	 */
	var packagerConfig = {
		libs: 		{},
		packages:	{},
		paths:		[]
	};
	
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
	 * @param scope {Any} 回调方法的作用域
	 * @return {Function} 生成的事件监听器方法，其输入参数只有一个，为加载成功的包名称
	 */
	var createPackageCompleteListener = function(usedPackages, callback, scope) {
		return function(name) {
			if (--usedPackages.unavilable <= 0) {
				// 需要的包全部加载完成，可以执行了回调方法了
				
				// 放到下一个队列的原因是，避免太多JS在一起执行
				setTimeout(function() {
					// 轮询所有的包，获取包的内容
					var objects = [];
					for (var i = 0, il = usedPackages.length; i < il; i++) {
						objects = Packager._package(usedPackages[i]).entity();
					}
					
					// 调用回调方法
					callback.apply(scope || window, objects);
				}, 0);
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
				if (typeof args[1] != 'function') {
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
