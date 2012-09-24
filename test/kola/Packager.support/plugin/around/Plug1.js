kola('plugin.around.Plug1', null, function() {
	
	return {
		isDead__around__: function(fn) {
			return fn() + '？';
		},
		
		build__around__: function(fn, name) {
			if (this.name != '大家') {
				return '搞不定';
			} else {
				return this.name + fn(name);
			}
		}
	};
	
});
