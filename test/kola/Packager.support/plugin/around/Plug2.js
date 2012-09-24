kola('plugin.around.Plug2', null, function() {
	
	return {
		build__around__: function(fn, name) {
			return fn(name) + '；Plug2也去建造' + name;
		}
	};
	
});
