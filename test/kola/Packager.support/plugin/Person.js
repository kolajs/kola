kola('plugin.Person', 'kola.Packager', function(Packager) {
	
	var exports = Packager.createClass({
		
		_init: function(name) {
			this.name = name;
		},
		
		work: function() {
			return '去工作';
		},
		
		sleep: function() {
			return '去睡觉';
		}
		
	});
	
	return exports;
	
});
