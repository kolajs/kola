kola('simple.hasdependence.manydependence.E', [
	'simple.A'
	, 'simple.B'
], function(A, B) {
	
	return {
		name: 'simple.hasdependence.manydependence.E',
		dependence: [A, B]
	};
	
});
