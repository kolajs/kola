kola('kola.dom.Operation',[
	'kola.bom.Browser'
],function(Browser) {
	var exports = {
		// value get(name) | chain set(name, value)
		attr: [
			/**
			 * 获取某个属性值
			 * @method attr
			 * @param targetElement {HTMLElement} 操作的element对象
			 * @param name {String} 属性名
			 * @return {String} 属性值
			 */
			function(targetElement, name){
				switch(name){
					case 'class':
						return targetElement.className;
					case 'style':
						return targetElement.style.cssText;
					default:
						return attr(targetElement, name);
				}
			},
			/**
			 * 设置某个属性值
			 * @method attr
			 * @param targetElement {HTMLElement} 操作的element对象
			 * @param name {String} 属性名
			 * @param value {String} 属性值
			 * @chainable
			 */
			function(targetElement, name, value){
				switch(name){
					case 'class':
						targetElement.className = value;
						break;
					case 'style':
						targetElement.style.cssText = value;
						break;
					default:
						//	如果是设置一个事件，而且是ie下的话，需要采用.on...的形式，setAttribute的形式是有问题的
						if (Browser.IEStyle && name.indexOf('on') == 0) {
							//	如果是字符串，需要转换成一个方法，ie下只能接受方法
							if (typeof(value) == 'string') {
								value = new Function(value);
							}
							targetElement[name] = value;
						} else {
							targetElement.setAttribute(name, value);
						}
				}
			}
		],
		find: function (element, selector) {
            return Selector(selector, element).concat(Selector.filter(selector, [element]));
        },
	}
	/**
	 * 获取一个对象的某个attribute，主要是为了解决IE下在form节点上获取attribute不对的问题
	 */
	var attr = function (element, name) {
	
		var value = element.getAttribute(name);
		
		//todo:对表单元素属性的封装
		if(value == null){
			value = element[name];
		}
		if (document.all && typeof(value) == 'object' && value != null) {
			value = element.attributes.getNamedItem(name);
			return !!value ? value.value : null;
		}
		return value;
	};
	
	return exports;
});