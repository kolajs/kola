kola('kola.html.Input',[
	'kola.html.util.Event',
	'kola.html.Element'
],function(Event, $){
	var IEStyle = (navigator.userAgent.indexOf('MSIE') != -1 && parseInt(navigator.userAgent.substr(navigator.userAgent.indexOf( 'MSIE' ) + 5, 3)) < 9);
	var restrictDefault = {
		number:/[^0-9]/g,
		name:/[^a-zA-Z0-9]/g
	}
	var _program_change = false;
	if(IEStyle){
		var Operations = {
			setval: function(targetElement, value){
				if(targetElement.value == value)
					return;
				_program_change = true;
				targetElement.value = value;
				_program_change = false;
				targetElement.blur();
				targetElement.focus();
			}
		};
	}else{
		var Operations = {
			setval: function(targetElement, value){
				if(targetElement.value == value)
					return;
				targetElement.value = value;
				Event.fire(targetElement, "valuechange");
			}
		}
	}
	function placeholder_blur(e){
		if(e.target.value.length == 0 && !$._operations.getcss(e.target, 'placeholder')){
			$._operations.setcss(e.target, 'placeholder', true);
			Operations.setval(e.target, $._operations.getattr(e.target, 'placeholder'));
		}
	}
	function placeholder_focus(e){
		if($._operations.getcss(e.target, 'placeholder')){
			Operations.setval(e.target, '');
		}
		$._operations.setcss(e.target, 'placeholder', false);
	}
	var exports = {
		/**
		 * 查询一个表单的值
		 * @method val
		 * @return {String} 样式的值
		 */
		/**
		 * 设置一个表单的值
		 * @method val
		 * @param value {String} 样式的值
		 * @chainable
		 */
		val: function(value){
			var elements = this.getData();
			if(arguments.length == 0){
				return elements[0].value;
			}else{
				for(var i = 0; i < elements.length; i++){
					Operations.setval(elements[i], value);
				}
				return this;
			}
		},
		/**
		 * 绑定该表单元素的oninput事件
		 * @method input
		 * @param callback {Function} 事件的回调函数
		 * @param options {Object} 样式的值
		 * @chainable
		 */
		input: function(callback, options){
			var elements = this.getData();
			for(var i = 0; i < elements.length; i++){
				Event.on(elements[i], 'input', callback, options, inputSpecialValue);
			}
			return this;
		},
		/**
		 * 限定该输入框只能输入选中的字符
		 * @method restrict
		 * @param chars {String} 选择的字符
		 * @chainable
		 */
		restrict: function(chars){
			if(typeof chars === 'string'){
				var reg = new RegExp('[^' + chars + ']', 'g');
			}else{
				var reg = restrictDefault[chars];
			}
			return this.input(function(e){
				Operations.setval(e.target, e.target.value.replace(reg, ''));
			});
		},
		/**
		 * 给当前元素增加placeholder
		 * @method placeholder
		 * @chainable
		 */
		placeholder: function(){
			this.blur(placeholder_blur);
			this.focus(placeholder_focus);
			return this;
		},
		/**
		 * 绑定该表单元素的change事件,该表单元素的任何value改变都会触发（包括程序触发）
		 * @method change
		 * @param callback {Function} 事件的回调函数
		 * @param options {Object} 样式的值
		 * @chainable
		 */
		change: function(callback, options){
			var elements = this.getData();
			if(IEStyle){
				for(var i = 0; i < elements.length; i++){
					Event.on(elements[i], 'propertychange', callback, options, inputSpecialChange);
				}
			}else{
				for(var i = 0; i < elements.length; i++){
					Event.on(elements[i], 'valuechange', callback, options);
					Event.on(elements[i], 'input', callback, options);
				}
			}
			return this;
		}
	};
	if(IEStyle){
		var inputSpecialValue = {
			domEvtName: 'propertychange',
			check: function(element, evt){
				if(window.event.propertyName != 'value' || _program_change) return true;
				return false;
			}
		}
		var inputSpecialChange = {
			check: function(element, evt){
				if(window.event.propertyName != 'value') return true;
				return false;
			}
		}
	}
	return exports;
});