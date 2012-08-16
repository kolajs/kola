kola('simple.hasdependence.manydependence.F', [
	'simple.A'
	, 'simple.B'
	, 'simple.hasdependence.C'
	, 'simple.hasdependence.D'
	, 'simple.hasdependence.manydependence.E'
], function(A, B, C, D, E) {
	
	return {
		name: 'simple.hasdependence.manydependence.F',
		dependence: [A, B, C, D, E]
	};
	
});