RichElement
	getInput(inputControllerName)  ---> 得到对应的object

Element Attribute:
	style(name, value) ---> 设置值				style(name,value)
	style(name) ---> 取得值						style(name)
	style(name, undefined) ---> 删除值			removeStyle(name)

	class(name, true) ---> 设置class			addClass(name)
	class(name) ---> 取得class					hasClass(name)
	class(name, undefined) ---> 删除class		removeClass(name)

	attr,prop同理

	data(name) ---> 取得值	
	data(name, value)  ---> 设置值
	data(name, undefined) ---> 删除值			removeData(name)
	data(undefined) ---> 删除所有值				removeAllData()
	DATA()
Element Event:
	handle on(name, callback, option)
	off(name, callback, option)  -----buggy
	?? off(handle) handle.remove()
	fire()
	mouseover, click, mouseenter.....

Element Display
	position
	width
	heigh
	box

//////////////////////////////////////////////////////////////////////////
Tree test
	is()
	contains()

Tree travel:
	parent()
	parents(selector)
	closest(selector)
	children(selector)
	find(selector)
	decendent(selector)
	prev(selector)
	next(selector)
	firstChild(selector)
	lastChild(selector)

	?? eachChild(callback)

Tree edit:
	html
	text
	outer
	append
	prepend
	after
	before
	remove	??detach

//////////////////////////////////////////////////////////////////////////

GroupManager
	数组操作封装
	function(element){}  ------> function(){this._each(function(element){XXXX})}

	?? KolaElement _KolaSingleElement

	add
	remove
	elements
	each

<input class="mailInput" />   ----->   emailInstance
///////////////////////////////////////////////
kola("kola.HtmlElement[email]",function(){
	$(".mailInput").isEmailOk()
});

isEmailOk:function(){
	var email = this.data("email")
	return email.isEmailOk();
}
////////////////////////////////////////////////
kola("kola.HtmlElement",function(){
	var email = $(".mailInput").data("email");
	email.isEmailOk()
});