kola('plugin.Person', 'kola.Packager', function(Packager) {
	
	var exports = Packager.createClass({
		
		_init: function(name) {
			this.name = name;
		},
		
		work: function() {
			var value = '去工作';
			for (var i = 0, il = arguments.length; i < il; i++) {
				value = arguments[i] + '\n' + value;
			}
			return value;
		},
		
		sleep: function() {
			return '去睡觉';
		},
		
		build: function(name) {
			return '建造' + name;
		}
		
	});
	
	return exports;
	
});
