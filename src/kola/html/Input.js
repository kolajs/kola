kola('kola.html.Input',[
	'kola.html.util.Event',
	'kola.html.Element'
],function(Event, $){
	var _program_change = false;
	var Operations = {
		setval: function(targetElement, value){
			_program_change = true;
			targetElement.value = value;
			_program_change = false;
			targetElement.blur();
			targetElement.focus();
		}
	};
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
				Event.on(elements[i], 'input', callback, options, inputSpecial);
			}
			return this;
		},
		restrict: function(chars){
			return this.input(function(e){
				var reg = new RegExp("[^" + chars + "]", "g");
				Operations.setval(e.target, e.target.value.replace(reg, ""));
			});
		},
		placeholder: function(){

		}
	};
	var IEStyle = (navigator.userAgent.indexOf('MSIE') != -1 && parseInt(navigator.userAgent.substr(navigator.userAgent.indexOf( 'MSIE' ) + 5, 3)) < 9);
	if(IEStyle){
		var inputSpecial = {
			setup: function(element, name, callback, observer){
				observer.name = 'propertychange';
			},
			check: function(element, evt){
				if(window.event.propertyName != 'value' || _program_change) return true;
				return false;
			}
		}
	}
	return exports;
});