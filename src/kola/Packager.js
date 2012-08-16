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
	 * 给方法绑定一个作用域
	 */
	var bindScope = function(fn, scope) {
		var args = [];
		for (var i = 2, il = arguments.length; i < il; i++) {
			args.push(arguments[i]);
		}
		return function() {
			for (var i = 0, il = arguments.length; i < il; i++) {
				args.push(arguments[i]);
			}
			return fn.apply(scope, args);
		};
	};
			
	/**
	 * 删除字符串中的所有空格
	 */
	var trimAll = function(string) {
		var reg = /\s/mg;
		trimAll = function(string) {
			return string.replace(reg, '');
		};
		return trimAll(string);
	};
	
	/**
	 * 抛出一个错误信息
	 */
	var throwError = function(message) {
		if (window.Error) {
			throw new Error(message);
		}
	};
	
	/*********************************************************************
	 *                        kola类相关
	 ********************************************************************/
	
	/**
	 * 创建一个新的类构造器
	 */
	var newConstructor = function() {
		return function() {
			// 调用初始化方法
			this._init.apply(this, arguments);
			
			// 设置当前对象的初始化方法为null
			this._init = null;
		};
	};
	
	/**
	 * 创建一个新的AllInOne类构造器
	 */
	var newAllIn1Constructor = function(init, me) {
		return function() {
			if (this && (init === this._init)) {
				// 如果存在初始化方法，并且跟当前类的初始化方法相同，那就认为是实例化
				init.apply(this, arguments);
				
				// 将实例的_init设置为null，是为了标记其已经进行过了实例化
				this._init = null;
			} else {
				
				// 不存在有效的初始化方法，那说明这是直接调用方式
				me.apply(arguments.callee, arguments);
			}
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
		// 判断是否指定了父类
		if (arguments.length == 1) {
			methods = superClass;
			superClass = null;
		}
		
		// 建立原型对象
		var prototypeInstance;
		if (superClass === null) {
			// 这时候methods一定不为null
			prototypeInstance = methods;
		} else {
			// 需要建立一个中间类，用于生成一个原型对象
			var prototypeClass = newEmptyFunction();
			var superPrototype = superClass.prototype;
			prototypeClass.prototype = superPrototype;
			prototypeInstance = new prototypeClass();
							
			// 复制方法列表到原型对象上
			for (var name in methods) {
				prototypeInstance[name] = methods[name];
			}
		}
		
		// 如果不存在自己的_init初始化方法，那就创建一个默认的方法
		if (typeof prototypeInstance._init != 'function' || !prototypeInstance.hasOwnProperty('_init')) {
			prototypeInstance._init = newEmptyFunction();
		}
		
		// 创建新的类，并根据是否存在直接调用方法，进行不同的处理
		var newClass = prototypeInstance.hasOwnProperty('__ME') 
			&& typeof prototypeInstance.__ME == 'function'
			? newAllIn1Constructor(prototypeInstance._init, prototypeInstance.__ME)
			: newConstructor(); 
		newClass.prototype = prototypeInstance;	
		
		return newClass;
	};
	
	/**
	 * 创建一个加入插件的新类
	 * 
	 * @param superClass {KolaClass} 父类
	 * @param plugin* {Object} 插件
	 * @return {KolaClass}
	 */
	var newPluginJoinedClass = function(superClass) {
		// 从父类复制一下关键方法
		var superPrototype = superClass.prototype;
		var methods = {
			_init: superPrototype._init		// 父类必然存在初始化方法
		};
		
		// 如果父类存在__ME方法，那就复制
		if (typeof superPrototype.__ME == 'function' && superPrototype.hasOwnProperty('__ME')) {
			methods.__ME = superPrototype.__ME;
		}
		
		// 创建新类
		var newClass = newKolaClass(superClass, methods);
		var newClassPrototype = newClass.prototype;
		
		//	循环添加每个插件对象到原型上
		var aops = [];
		for (var i = 1, il = arguments.length; i < il; i++) {
			var plugin = arguments[i];
			for (var item in plugin) {
				var before = -1,
					after = -1,
					index = -1,
					realName = '';
					
				//	如果存在前置切面方法，那就处理之
				if ((before = item.indexOf('__before__')) != -1) {
					realName = item.substring(0, before);
					if (typeof (index = aops[realName]) != 'number') {
						index = aops[realName] = aops.length;
						aops.push({
							name: realName,
							befores: [],
							afters: []
						});
					}
					aops[index].befores.push(plugin[item]);
					
				} else if ((after = item.indexOf('__after__')) != -1) {
					//	如果存在前置切面方法，那就处理之
					realName = item.substring(0, after);
					if (typeof (index = aops[realName]) != 'number') {
						index = aops[realName] = aops.length;
						aops.push({
							name: realName,
							befores: [],
							afters: []
						});
					}
					aops[index].afters.push(plugin[item]);
				} else {
					//	只有当当前方法不是切面方法时，才予以添加
					newClassPrototype[item] = plugin[item];
				}
			}
		}
		
		// 如果存在切面方法，那就替代相应方法
		if (aops.length > 0) {
			for (var i = 0, il = aops.length; i < il; i++) {
				var aop = aops[i];
				
				//	生成替代方法
				newClassPrototype[aop.name] = createAopedFunc(newClassPrototype[aop.name], aop);
			}
		}
		
		// 复制父类的静态属性和方法
		for (var item in superClass) {
			newClass[item] = superClass[item];
		}
		
		return newClass;
	};
	
	/**
	 * 生成一个新的Aop方法
	 * @param fn {Function} 原生的方法
	 * @param aop {Object} aop配置参数
	 * 	@param befores {Array<Function>} 之前需要调用的方法
	 * 	@param afters {Array<Function>} 之后需要调用的方法
	 */
	var createAopedFunc = function(fn, aop) {
		return function() {
			var args = [];
			for (var i = 0, il = arguments.length; i < il; i++) {
				args.push(arguments[i]);
			}
			
			//	如果存在调用前的方法，那就调用之
			var befores = aop.befores;
			if (befores.length > 0) {
				for (var i = 0, il = befores.length; i < il; i++) {
					var tempResult = befores[i].apply(this, args);
					if (typeof tempResult != 'undefined') {
						args = tempResult;
					}
				}
			}
			
			//	调用原来的方法
			var result = fn.apply(this, args);
			
			//	如果存在调用后的方法，那就调用之
			var afters = aop.afters;
			if (afters.length > 0) {
				args.unshift(result);
				for (var i = 0, il = afters.length; i < il; i++) {
					var tempResult = afters[i].apply(this, args);
					if (typeof tempResult != 'undefined') {
						args = tempResult;
					}
				}
				result = args[0];
			}
			
			return result;
		};
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
	
	var Package = newKolaClass(null, {
		
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
			
			// 跟踪error事件，用于发现链接错误或包名笔误的包
			script.onerror = bindScope(scriptFail, this, this._name, script);
			
			// 跟踪加载完成事件，用于发现包执行错误或者期望与实际包名不同的包
			script.onload = bindScope(scriptSucc, this, this._name, script);
			
			// 设置加载状态为加载中
			this.status(PackageStatus.loading);
			
			// 开始加载
			(document.head || document.getElementsByTagName('head')[0]).appendChild(script);
			
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
				case PackageStatus.uninitialized:
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
		
		// FIXME: 临时的输出语句
		if (this._status == PackageStatus.complete) {
			throwError('重复将包' + this._name + '置为可用状态');
		}
				
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
	
	/**
	 * 文件加载失败的调用方法
	 * 
	 * @param packageName {String} 对应的包名称
	 * @param node {HTMLElement} 对应的script节点
	 */
	var scriptFail = function(packageName, node) {
		// 设置为错误状态
		this._status = PackageStatus.failed;
		
		// 显示错误
		throwError("can't load package " + packageName + " in uri: " + node.src);
		
		// 去除事件绑定
		node.onerror = null;
		node.onload = null;
	};
	
	/**
	 * 文件加载成功后的调用方法
	 * 
	 * @param packageName {String} 对应的包名称
	 * @param node {HTMLElement} 对应的script节点
	 */
	var scriptSucc = function(packageName, node) {
		var scope = this;
		setTimeout(function() {
			// 如果该包还处于未加载完成状态，那就报错
			if (scope._status < PackageStatus.loaded) {
				// 显示错误
				throwError("can't define package " + packageName);
			}
		}, 0);
		
		// 去除事件绑定
		node.onerror = null;
		node.onload = null;
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
					if (dependence !== null && dependence.length) {
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
			packages = parsePackages(packages);
			var following = packages.concat(packages.plugin);
			packages.unavilable = following.length;	// 无效包的个数
			
			// 创建一个完成后的回调方法
			var completeListener = createPackageCompleteListener(packages, callback, scope);
			
			// 循环每个依赖包，监听其complete事件
			for (var i = 0, il = following.length; i < il; i++) {
				Packager._package(following[i]).complete(completeListener);
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
			var names = name.split('.');
			
			// TODO: 先到packages上寻找
			
			// 在libs上查找
			var libs = packagerConfig.libs;
			if (libs) {
				for (var il = names.length, i = il - 1; i >= 0; i--) {
					var config = libs[names.slice(0, i).join('.')];
					if (config) {
						config = objectExtend(config, {});
						config.uri = config.path 
							+ names.slice(i, il).join('/') 
							+ '.js';
							
						delete config.path;
						return config;
					}
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
					index = src.lastIndexOf('kola', index);
					if (index == -1) continue;
					
					// 找到kola之前的/，这就是path
					path = packagerConfig.path = src.substr(0, src.lastIndexOf('/', index) + 1);
					
					break;
				}
			}
			if (path) {
				var pathObj = {
					uri: path + names.join('/') + '.js'
				};
				
				// 使用全局的编码信息
				var charset = packagerConfig.charset;
				if (typeof charset == 'string' && charset.length > 0) {
					pathObj.charset = charset;
				}
				return pathObj;
			}
			
			// 没有找到路径信息，抛出错误
			throwError("can't get file path of package " + name);
		},
		
		/**
		 * 创建一个新类
		 * 
		 * @method createClass
		 * @param [superClass] {Function} 父类
		 * @param methods {Object} 方法列表
		 * @return {KolaClass}
		 */
		createClass: newKolaClass,
		
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
		uris:		[]
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
				
				// 轮询所有的包，获取包的内容
				var objects = [];
				for (var i = 0, il = usedPackages.length; i < il; i++) {
					var object = Packager._package(usedPackages[i]).entity();
					
					// 如果存在插件的话，那就生成加入插件的包
					var plugin = usedPackages['_' + i];
					if (plugin) {
						// 获取每个插件的实体内容
						for (var j = 0, jl = plugin.length; j < jl; j++) {
							plugin[j] = Packager._package(plugin[j]).entity();
						}
						
						// 增加基类和methods
						plugin.unshift(object);	// 基类
						
						// 生成新的类
						object = newPluginJoinedClass.apply(window, plugin);
					}
					
					objects.push(object);
				}
				
				// 调用回调方法
				callback.apply(scope || window, objects);
			}
		};
	};
			
	/**
	 * 把包含包名（单个包名中可能包含插件名列表）列表的数组转为一个特殊格式的数组
	 */
	var parsePackages = function(packages) {
		var allPlugin = [];
		for (var i = 0, il = packages.length; i < il; i++) {
			var name = packages[i];
			var index = name.indexOf('[');
			if (index == -1) continue;
			
			// 找到插件列表
			var plugin = name.substring(index + 1, -1).split(',');
			packages['_' + i] = plugin;
			allPlugin = allPlugin.concat(plugin);
			
			// 记录下当前包的名称
			packages[i] = name.substr(0, index);
		}
		packages.plugin = allPlugin;
		return packages;
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
	// FIXME: 还没有增加插件支持
	// TODO: 还未解决循环依赖问题
	// TODO: 还未增加对lib和版本的支持
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
	// FIXME: kola的状态在这时，竟然是2，需要解决。对于所有依赖为null的，都需要考虑
	Packager.define('kola.Packager', null, function() {
		return Packager;
	});
	
	// 如果存在之前的kola调用缓存，那就依次执行之
	if (typeof cachedKolaCall == 'object' 
		&& cachedKolaCall !== null 
		&& cachedKolaCall.shift
	) {
		var callArgs;
		while (callArgs = cachedKolaCall.shift()) {
			var args = callArgs,
				scope = callArgs.shift();
			setTimeout(function() {
				kola.apply(scope, args);
			}, 0);
		}
	}
	
	return kola;
	
})(window.kola);
