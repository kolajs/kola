kola('kola.html.Display', 
	['kola.html.ElementCore'],
function(KElement){
    var Display={
        /**
		 * 获取第一个对象的位置，相对于其定位对象的位置
		 * @return 位置
		 * @type Object
		 */
		/**
		 * 设置对象的位置，相对于其定位对象的位置
		 * @param {Object} position 新位置
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		pos: function(position) {
			if (typeof(position) == 'undefined') {
				//	获取位置值
				
				var element = this[0];
				return {
					left: element.offsetLeft,
					top: element.offsetTop
				};
			} else {
				//	设置位置值
				
				this._each( function(element) {
					if ( !isNaN( position.left ) ) element.style.left = position.left + 'px';
					if ( !isNaN( position.top ) ) element.style.top = position.top + 'px';
				});
				return this;
			}
		},
		
		/**
		 * 获取第一个对象的位置，相对于浏览器窗口区域的位置
		 * @return 位置
		 * @type Object
		 */
		/**
		 * 设置对象的位置，相对于浏览器窗口区域的位置
		 * @param {Object} position 新位置
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		clientPos: function(position) {
			if (typeof(position) == 'undefined') {
				//	获取位置值
				
				var pos = pagePos(this[0]),
					db = document.body,
					de = document.documentElement;
				return {
					left: pos.left - Math.max(db.scrollLeft, de.scrollLeft),
					top: pos.top - Math.max(db.scrollTop, de.scrollTop)
				};
			} else {
				//	设置位置值
				
				//	FIXME: 这里应该是设置相对于浏览器窗口区域的，而不是现在的left和top值
				this._each( function(element) {
					element.style.left = position.left + 'px';
					element.style.top = position.top + 'px';
				});
				return this;
			}
		},
		
		/**
		 * 获取第一个对象在页面上的绝对位置
		 * @return 位置
		 * @type Object
		 */
		/**
		 * 设置对象的绝对位置
		 * @param {Object} position 新位置
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		pagePos: function(position) {
			if (typeof(position) == 'undefined') {
				//	获取对象的绝对位置
				
				return pagePos(this[0]);
			} else {
				//	设置对象的绝对位置
				
				//	FIXME: 这里应该是设置绝对位置，而不是现在的left和top值
				this._each( function(element) {
					var pos = pagePos( element );
					//	如果设置了left值，那就计算left坐标
					if ( typeof position.left == 'number' ) {
						var left = KElement.util.getComputedStyle( element, 'left' );
						if ( !left ) {
							left = 0;
						} else {
							if ( typeof( left = parseFloat( left ) ) != 'number' ) {
								left = 0;
							}
						}
						element.style.left = ( position.left + left - pos.left) + 'px';
					}
					//	如果设置了top值，那就计算top坐标
					if ( typeof position.top == 'number' ) {
						var top = KElement.util.getComputedStyle( element, 'top' );
						if ( !top ) {
							top = 0;
						} else {
							if ( typeof( top = parseFloat( top ) ) != 'number' ) {
								top = 0;
							}
						}
						element.style.top = ( position.top + top - pos.top) + 'px';
					}
				});
				return this;
			}
		},
		
		/**
		 * 获取第一个对象的宽度
		 * @return 宽度
		 * @type Number
		 */
		/**
		 * 设置对象的宽度
		 * @param {Number} value 新宽度
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		width: function(value) {
			if (typeof(value) == 'undefined') {
				//	获取宽度
				return this[0].offsetWidth;
			} else {
				//	设置宽度
				
				this._each( function(element) {
					element.style.width = value + 'px';
				});
				return this;
			}
		},
		
		/**
		 * 获取第一个对象的高度
		 * @return 高度
		 * @type Number
		 */
		/**
		 * 设置对象的高度
		 * @param {Number} value 新高度
		 * @return 当前的Element对象
		 * @type kola.html.Element
		 */
		height: function(value) {
			if (typeof(value) == 'undefined') {
				//	获取宽度
				
				return this[0].offsetHeight;
			} else {
				//	设置宽度
				
				this._each( function(element) {
					element.style.height = value + 'px';
				});
				return this;
			}
		},

		/**
		 * 获取第一个对象客户区域的宽度
		 * @return 宽度
		 * @type Number
		 */
		clientWidth: function(value) {
			//	获取宽度
			return this[0].clientWidth;
		},

		/**
		 * 获取第一个对象客户区域的高度
		 * @return 高度
		 * @type Number
		 */
		clientHeight: function() {
			//	获取宽度
			return this[0].clientHeight;
		},

		/**
		 * 获取第一个对象滚动区域的宽度
		 * @return 宽度
		 * @type Number
		 */
		scrollWidth: function(value) {
			//	获取宽度
			return this[0].scrollWidth;
		},

		/**
		 * 获取第一个对象滚动区域的高度
		 * @return 高度
		 * @type Number
		 */
		scrollHeight: function() {
			//	获取宽度
			return this[0].scrollHeight;
		}
    }
    return Display;
});