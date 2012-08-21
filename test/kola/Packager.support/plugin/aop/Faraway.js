kola('plugin.aop.Faraway', null, function() {
	
	var exports = {
		
		build__after__: function(value, name) {
			return [value + '\n' + '每天去这个“' + name + '”也很远', name];
		}
		
	};
	
	return exports;
	
});
