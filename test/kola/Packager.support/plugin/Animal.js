kola('plugin.Animal', 'kola.Packager', function(Packager) {
	
	var exports = Packager.createClass({
		
		_init: function(name) {
			this.name = name;
		},
		
		isDead: function() {
			return '还没死';
		}
		
	});
	
	return exports;
	
});
