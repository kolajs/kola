/**
 * kola是一个面向于大型、富交互Web应用的基础框架
 * 
 * @module kola
 * @main kola
 * 
 * @author Jady Yang
 */

window.kola = (function(kola) {
	
	/*********************************************************************
	 *                        辅助方法
	 ********************************************************************/
	
	/**
	 * Array原生的slice方法
	 */
	var slice = Array.prototype.slice;
	
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
	
	var newKolaClass = (function() {
	
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
					return me.apply(arguments.callee, arguments);
				}
			};
		};
		
		/**
		 * 创建一个新的类
		 * 
		 * @param [superClass] {KolaClass} 父类
		 * @param prototypes {Object} 方法列表
		 * @return {KolaClass}
		 */
		return function(superClass, prototypes) {
			// 判断是否指定了父类
			if (arguments.length == 1) {
				prototypes = superClass;
				superClass = null;
			}
			
			// 建立原型对象
			var prototypeInstance;
			if (superClass === null) {
				// 这时候methods一定不为null
				prototypeInstance = prototypes;
			} else {
				// 需要建立一个中间类，用于生成一个原型对象
				var prototypeClass = newEmptyFunction();
				var superPrototype = superClass.prototype;
				prototypeClass.prototype = superPrototype;
				prototypeInstance = new prototypeClass();
								
				// 复制方法列表到原型对象上
				for (var name in prototypes) {
					prototypeInstance[name] = prototypes[name];
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
	
	})();
	
	/*********************************************************************
	 *                        Packages内容获取器
	 ********************************************************************/
	
	var packageEntities = (function() {
	
		/**
		 * Aop方法列表
		 */
		var AopMethod = {
			before: 1,
			after: 1
		};
		
		/**
		 * 生成一个新的Aop方法
		 * @param fn {Function} 原生的方法
		 * @param aop {Object} aop配置参数
		 * 	@param before {Array<Function>} 之前需要调用的方法
		 * 	@param after {Array<Function>} 之后需要调用的方法
		 */
		var createAopedFunc = function(fn, aop) {
			return function() {
				var args = slice.call(arguments);
				
				//	如果存在调用前的方法，那就调用之
				var before = aop.before;
				if (before.length > 0) {
					for (var i = 0, il = before.length; i < il; i++) {
						var tempResult = before[i].apply(this, args);
						if (typeof tempResult != 'undefined') {
							args = tempResult;
						}
					}
				}
				
				// 那就调用原来的方法
				var result = fn.apply(this, args);
				
				//	如果存在调用后的方法，那就调用之
				var after = aop.after;
				if (after.length > 0) {
					args.unshift(result);
					for (var i = 0, il = after.length; i < il; i++) {
						var tempResult = after[i].apply(this, args);
						if (typeof tempResult != 'undefined') {
							args = tempResult;
						}
					}
					result = args[0];
				}
				
				return result;
			};
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
					var names = item.split('__');
					
					// 判断是否是一个注入
					if (names.length === 3 
						&& names[0].length > 0 
						&& AopMethod[names[1]] === 1
						&& names[2].length === 0
					) {
						var name = names[0];
						
						// 如果不存在包装对象，那就创建之
						var index = aops[name];
						if (typeof index != 'number') {
							aops[name] = index = aops.length;
							aops.push({
								name: 	name,
								before: [],
								after:	[]
							});
						}
						
						aops[index][names[1]].push(plugin[item]);
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
		 * 获得一系列包的实体内容。其参数大体是由方法产生的，格式比较特殊
		 */
		return function(packages) {
			var values = [];
			for (var i = 0, il = packages.length; i < il; i++) {
				var object = getPackage(packages[i]).entity();	
							
				// 如果存在插件的话，那就生成加入插件的包
				var plugin = packages['_' + i];
				if (plugin) {
					// 获取每个插件的实体内容
					for (var j = 0, jl = plugin.length; j < jl; j++) {
						plugin[j] = getPackage(plugin[j]).entity();
					}
					
					// 增加基类和methods
					plugin.unshift(object);	// 基类
					
					// 生成新的类
					object = newPluginJoinedClass.apply(window, plugin);
				}
				
				values.push(object);
			}
			return values;
		};
	
	})();
	
	/*********************************************************************
	 *                        Package类
	 ********************************************************************/
	
	var Package = (function() {
	
		/****************** Package加载状态 *******************/
		
		/**
		 * Package加载状态枚举类
		 */
		var PackageStatus = {
			UNINITIALIZED:	0,		// 未初始化
			LOADING:		1,		// 加载中
			LOADED:			2,		// 加载完成
			FAILED:			-1,		// 加载失败
			DEPENDING:		3,		// 依赖包正在加载中
			INACTIVE:		4,		// 待用（所有直接或间接依赖包已经加载完成）
			ACTIVE:			5		// 可用
		};
	
		/****************** Package私有方法 *******************/
	
		/**
		 * 给方法绑定一个作用域
		 */
		var bindScope = function(fn, scope) {
			var args = slice.call(arguments, 2);
			return function() {
				return fn.apply(scope, args.concat(slice.call(arguments)));
			};
		};
		
		/**
		 * 加载当前包
		 */
		var load = function() {
			var name = this._name;
			
			// 获取路径信息
			var path = Packager.path(name);
			
			// 创建用于加载的script节点，并设置相关信息
			var script = document.createElement('script');
			script.src = path.uri;
			if (path.charset) {
				script.charset = path.charset;
			}
			
			// 跟踪error事件，用于发现链接错误或包名笔误的包
			script.onerror = bindScope(scriptFail, this, name, script);
			
			// 跟踪加载完成事件，用于发现包执行错误或者期望与实际包名不同的包
			script.onload = bindScope(scriptSucc, this, name, script);
			
			// 设置加载状态为加载中
			this._status = PackageStatus.LOADING;
			
			// 开始加载
			(document.head || document.getElementsByTagName('head')[0]).appendChild(script);
		};
			
		/**
		 * 开始加载依赖包
		 */
		var depend = function() {
			// 设置状态为完成状态
			this._status = PackageStatus.DEPENDING;
			
			if (this._dependence) {
				// 有依赖包
				Packager.use(this._dependence, bindScope(inactivate, this), this);
			} else {
				// 没有依赖包，那就直接进入待用状态
				inactivate.call(this);
			}
		};
			
		/**
		 * 设置为待用状态
		 */
		var inactivate = function() {
			this._status = PackageStatus.INACTIVE;
				
			// 如果存在可用状态的事件监听者，那就进入下一个状态
			if (this._activateListeners) {
				activate.call(this);
			}
		};
			
		/**
		 * 设置为可用状态
		 */
		var activate = function() {
			// 获得实体内容
			this._creator = this._creator.apply(window, this._dependence ? packageEntities(this._dependence) : []);
			
			// 清除不必要的属性
			delete this._dependence;
			
			// 设置状态为完成状态
			this._status = PackageStatus.ACTIVE;
			
			// 如果有监听activated事件的监听器，那就处理之
			var listeners = this._activateListeners;
			if (listeners) {
				var entity = this._creator;
				// 循环每个回调，依次执行之
				while (listener = listeners.shift()) {
					listener(entity);
				}
				
				// 清除
				delete this._activateListeners;
			}
		};
		
		/**
		 * 文件加载失败的调用方法
		 * 
		 * @param name {String} 对应的包名称
		 * @param node {HTMLElement} 对应的script节点
		 */
		var scriptFail = function(name, node) {
			// 设置为错误状态
			this._status = PackageStatus.FAILED;
			
			// 显示错误
			throwError("can't load package " + name + " in uri: " + node.src);
			
			clearScript(node);
		};
		
		/**
		 * 文件加载成功后的调用方法
		 * 
		 * @param name {String} 包名称
		 * @param node {HTMLElement} 对应的script节点
		 */
		var scriptSucc = function(name, node) {
			setTimeout(bindScope(function() {
				// 如果该包还处于未加载完成状态，那就报错
				if (this._status < PackageStatus.LOADED) {
					// 显示错误
					throwError("can't register package " + name);
				}
			}, this), 0);
			
			clearScript(node);
		};
		
		/**
		 * 清除script节点的相关绑定
		 * 
		 * @param node {HTMLElement} script节点
		 */
		var clearScript = function(node) {
			// 去除事件绑定
			node.onerror = null;
			node.onload = null;
		};
	
		/****************** Package类 *******************/
		
		var exports = newKolaClass({
			
			/**
			 * 每个kola包的对应控制类
			 * 
			 * @param name {String} 包全名
			 */
			_init: function(name) {
				this._name = name;
				
				// 设置为默认状态
				this._status = PackageStatus.UNINITIALIZED;
			},
			
			/**
			 * 获取包的状态
			 * 
			 * @return {Number}
			 */
			status: function(status) {
				return this._status;
			},
			
			/**
			 * 注册包的实体信息
			 * 
			 * @param creator {Function} 包内容生成器
			 * @param dependence {Array<String> | Null} 依赖包的列表
			 * @chainable
			 */
			register: function(creator, dependence) {
				// 如果状态不对，则不进行处理
				if (this._status >= PackageStatus.LOADED) return this;
				
				// 保留相关配置信息
				this._creator = creator;
				this._dependence = dependence;
				
				// 设置为加载完成状态
				this._status = PackageStatus.LOADED;
				
				// 如果存在可用状态的事件监听者或者不存在依赖者的话，都可以直接开始依赖的加载
				if (this._activateListeners || !this._dependence) {
					depend.call(this);
				}
				
				return this;
			},
			
			/**
			 * 监听可用状态事件
			 * 
			 * @param listener {Function} 包处于可用状态后的回调方法
			 * @chainable
			 */
			activate: function(listener) {
				var status = this._status;
				// 根据不同的状态，进行不同的处理
				if (status == PackageStatus.ACTIVE) {
					// 处于可用状态
					listener(this._creator);
				} else {
					// 保存到方法列表
					(this._activateListeners || (this._activateListeners = [])).push(listener);
					
					switch (status) {
						case PackageStatus.INACTIVE:
							// 处于待用状态，切换到可用状态
							activate.call(this);
							break;
						
						case PackageStatus.FAILED:
						case PackageStatus.UNINITIALIZED:
							// 需要加载
							load.call(this);
							break;
						
						case PackageStatus.LOADED:
							// 需要加载依赖
							depend.call(this);
							break;
						
						// 其他情况不需要处理
					}
				}
				return this;
			},
			
			/**
			 * 获取包的实体内容
			 * 
			 * @return {Any} 包的实体内容
			 */
			entity: function() {
				// 如果状态不对，那就提示之
				if (this._status != PackageStatus.ACTIVE) throwError('package ' + this._name + " is not ready");
				
				return this._creator;
			}
			
		});	
		
		return exports;
		
	})();
	
	/*********************************************************************
	 *                        getPackage 私有方法
	 ********************************************************************/
	
	var getPackage = (function() {
		/**
		 * 保存所有包的对应控制对象。这是个Map格式的对象，键值为包的全名称，值为对应的封装对象
		 * 
		 * @property packageObjects
		 * @type {Object}
		 */
		var packageObjects = {};
		
		/**
		 * 获取某个package的控制对象
		 * 
		 * @param name {String} package名称
		 * @return {Package} package控制对象
		 */
		return function(name) {
			// 没有该package那就创建之
			return packageObjects[name] || (packageObjects[name] = new Package(name));
		};
		
	})();
	
	/*********************************************************************
	 *                        Packager类
	 ********************************************************************/
	
	var Packager = (function() {
	
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
							toObject[name] = objectExtend(value, toObject[name] || {});
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
		 * 创建一个计数器，计数器被调用指定次数后会调用指定的回调函数
		 * 
		 * @param count {Number} 需要被调用的次数
		 * @param callback {Function} 包都加载完成后的回调方法
		 * @param scope {Any} 回调方法的作用域
		 * @return {Function} 生成新方法
		 */
		var callTimes = function(number, callback, scope) {
			return function() {
				if (--number <= 0) {
					callback.call(scope);
				}
			};
		};
		
		/**
		 * packager的配置信息
		 * 
		 * @type {Object}
		 */
		var packagerConfig = {
			libs: 		{},
			packages:	{},
			uris:		[]
		};
				
		/**
		 * 把包含包名（单个包名中可能包含插件名列表）列表的数组转为一个特殊格式的数组
		 */
		// TODO: 还未增加对lib和版本的支持
		var parsePackages = function(packages) {
			// 先转化为数组
			switch (typeof packages) {
				case 'string':
					packages = [packages];
				case 'object':
					// 如果是数组格式，那就分析出各种类型的package
					if (packages !== null && packages.length) {
						// 如果已经是解析过的对象，那就不做处理
						if (packages.plugin) return packages;
						
						packages = packages.concat();
						var allPlugin = [];
						for (var i = 0, il = packages.length; i < il; i++) {
							var name = trimAll(packages[i]);
							var index = name.indexOf('[');
							if (index == -1) continue;
							
							// 找到插件列表
							var plugin = name.substring(index + 1, name.length - 1).split(',');
							packages['_' + i] = plugin;
							allPlugin = allPlugin.concat(plugin);
							
							// 记录下当前包的名称
							packages[i] = name.substr(0, index);
						}
						packages.plugin = allPlugin;
						
						return packages;
					}
				default:
					return null;
			}
		};
		
		/**
		 * kola的Package控制管理中心
		 * 
		 * @class Packager
		 * @static
		 */
		var exports = {
			
			/**
			 * 使用某些包执行某个方法
			 * 
			 * @method use
			 * @param packages {String | Array<String>} 要使用的包，如果是string也就是一个包的包名，如果是Array，那可能就是依赖的包列表
			 * @param callback {Function} 包可用之后的回调方法
			 * @param [scope] {Any} 回调方法的作用域，没有的话就为Packager
			 */
			use: function(packages, callback, scope) {
				if (packages === null) throwError('wrong packages');
				packages = parsePackages(packages);
				
				// 创建一个依赖包可用后的回调方法
				var allPackages = packages.concat(packages.plugin);
				var fn = callTimes(allPackages.length, function() {
					callback.apply(scope || Packager, packageEntities(packages));
				});
				
				// 监听所有包的activate事件
				for (var i = allPackages.length - 1; i >= 0; i--) {
					getPackage(allPackages[i]).activate(fn);
				}
			},
			
			/**
			 * 定义一个包
			 * 
			 * @method define
			 * @param name {String} 包全名
			 * @param dependence {Array<String> | String | Null} 依赖包列表。
			 * 		如果为String类型，说明只有一个依赖包；
			 * 		如果是Array类型，那就是依赖包的列表；
			 * 		如果为null，即没有依赖包；
			 * @param creator {Function} 创造包内容的方法，其返回值就是包内容
			 */
			define: function(name, dependence, creator) {
				getPackage(name).register(creator, parsePackages(dependence));
			},
			
			/**
			 * 增量保存设置信息
			 * 
			 * @method config
			 * @param config {Object} 增量设置对象
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
			 * @param prototypes {Object} 属性和方法列表
			 * @return {KolaClass} 创建的新类
			 */
			createClass: newKolaClass
		};
		
		return exports;
		
	})();
	
	/*********************************************************************
	 *                         kola方法定义
	 ********************************************************************/
	
	return (function() {
		
		//	如果存在缓存的kola方法，那就保存之
		var cachedKolaCall = !!kola && kola._cache;
		
		/**
		 * 定义一个包
		 * 
		 * @method kola
		 * @for window
		 * @param name {String} 包名
		 * @param dependence {String | Array<String> | Null} 依赖包列表。
		 * 		如果是String类型，那就是只依赖一个包，即为依赖的包名；
		 * 		如果是Array类型，那就是依赖的包列表，每项就是一个依赖包的包名；
		 * 		如果为null，那就不依赖任何包；
		 * @param creator {Function} 包内容生成器
		 * @chainable
		 */
		/**
		 * 使用包进行某项操作
		 * 
		 * @method kola
		 * @for window
		 * @param packages {String | Array<String>} 要使用的包列表。
		 * 		如果是String类型，那就是只使用一个包，即为包名；
		 * 		如果是Array类型，那就是要使用的包列表，每项就是一个包名；
		 * @param callback {Function} 要执行的方法
		 * @param [scope] {Any} 被执行方法的作用域，如果没有设置那就是当前kola的作用域
		 * @chainable
		 */
		/**
		 * 加载一个kola设置对象
		 * 
		 * @method kola
		 * @for window
		 * @param config {Object} 设置对象
		 * @chainable
		 */
		var exports = function() {
			var args = arguments,
				scope = this;
			switch (args.length) {
				case 3:
					if (typeof args[1] != 'function') {
						// 这是定义包
						Packager.define.apply(Packager, args);
						break;
					}				
					// 这是包执行的方式，并且设置了scope
				case 2:
					// 这是使用包执行的方式
					
					Packager.use.call(Packager, args[0], args[1], args.length > 2 ? args[2] : this);
					break;
				case 1:
					// 这是加载配置信息
					Packager.config.apply(Packager, args);
			}
			
			return exports;
		};
	
		// 声明kola.Packager包
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
				exports.apply(scope, args);
			}
		}
		
		return exports;
	
	})();
	
})(window.kola);
