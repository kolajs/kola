kola('plugin.aop.Person', null, function() {
	
	var exports = {
		
		work__before__: function() {
			return ['坐公交车去'];
		},
		
		work__after__: function(value) {
			return [value + '\n' + '坐公交车回'];
		},
		
		build__before__: function(name) {
			return ['现代化的' + name];
		},
		
		build__after__: function(value, name) {
			return [value + '\n' + '那就开始吧！', name];
		},
		
		eat: function() {
			return '去吃饭';
		}
		
	};
	
	return exports;
	
});
