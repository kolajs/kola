kola('plugin.around.Plug3', null, function() {
	
	return {
		build__around__: function(fn, name) {
			return fn(name) + '；Plug3也去建造' + name;
		}
	};
	
});
