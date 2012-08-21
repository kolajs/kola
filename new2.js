RichElement
	getInput(inputControllerName)  ---> 得到对应的object

Element Attribute:
	style(name, value) ---> 设置值				style(name,value)   OK
	style(name) ---> 取得值						style(name)			OK
	style(name, undefined) ---> 删除值			removeStyle(name)	OK

	css(name, true) ---> 设置class				addClass(name)		OK
	css(name) ---> 取得class					hasClass(name)		OK
	css(name, undefined) ---> 删除class			removeClass(name)	OK

	attr,prop同理													OK

	data(name) ---> 取得值											OK
	data(name, value)  ---> 设置值									OK
	data(name, undefined) ---> 删除值			removeData(name)	OK
	data(undefined, undefined) ---> 删除所有值	removeAllData()		OK
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
	index()
Tree travel:
	parent()														OK
	parents(selector)												OK
	closest(selector)												OK
	children(selector)												OK
	find(selector)													OK
	descndent(selector)												OK
	prev(selector)													OK
	next(selector)													OK
	firstChild(selector)											Removed
	lastChild(selector)												Removed

	?? eachChild(callback)

Tree edit:
	html															OK
	text															OK
	outer															OK
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
//
selector 
toStyle
