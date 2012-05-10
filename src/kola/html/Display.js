kola('kola.html.Display', 
	['kola.html.ElementCore'],
function(KElement){
    var Display={
        /**
		 * 获取第一个对象的位置，相对于其定位对象的位置
		 * @return 位置
		 * @type Object
		 */
		pos: function() {
				var element = this[0];
				return {
					left: element.offsetLeft,
					top: element.offsetTop
				};
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
		clientPos: function() {
            var pos = pagePos(this[0]),
                db = document.body,
                de = document.documentElement;
            return {
                left: pos.left - Math.max(db.scrollLeft, de.scrollLeft),
                top: pos.top - Math.max(db.scrollTop, de.scrollTop)
            };
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
		outerWidth:function(){
            return this[0].offsetWidth+
                    parseInt(this.style("padding-left")||"0")+
                    parseInt(this.style("padding-right")||"0")+
                    parseInt(this.style("border-left")||"0")+
                    parseInt(this.style("border-right")||"0")+
                    parseInt(this.style("margin-left")||"0")+
                    parseInt(this.style("margin-right")||"0");
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
		outerHeight:function(){
            return this[0].offsetHeight+
                    parseInt(this.style("padding-top")||"0")+
                    parseInt(this.style("padding-down")||"0")+
                    parseInt(this.style("border-top")||"0")+
                    parseInt(this.style("border-down")||"0")+
                    parseInt(this.style("margin-top")||"0")+
                    parseInt(this.style("margin-down")||"0");
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
    };
    var pagePos = function(element) {
		var left = 0,
			top = 0,
			doc = document,
			de = doc.documentElement,
			db = doc.body,
			add = function(l, t) {
				left += l || 0;
				top += t || 0;
			};
		
		if (element.getBoundingClientRect) {
			//	存在方法直接获取位置，那就直接获取之
			
			var box = element.getBoundingClientRect();
			add(box.left + Math.max(de.scrollLeft, db.scrollLeft) - de.clientLeft,
					box.top + Math.max(de.scrollTop, db.scrollTop) - de.clientTop);
		} else {
			//	只能进行位置累加获取
			
			var op = element.offsetParent,
				parent = element.parentNode;
				
			add(element.offsetLeft, element.offsetTop);
			
			//	逐个累加每个offsetParent的位置
			while (op) {
				add(op.offsetLeft, op.offsetTop);
				op = op.offsetParent;
			}

			//	循环所有parentNode
			while (parent && parent.tagName && !isBody.test(parent.tagName) ) {
				add(-parent.scrollLeft, -parent.scrollTop);
				parent = parent.parentNode;
			}
		}
		return {left: left, top: top, x: left, y: top};
	};
    return Display;
});