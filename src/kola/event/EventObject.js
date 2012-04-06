/**
 * @fileOverview kola.event.EventObject 事件对象
 * @author Jady Yang
 * @version 2.0.0
 * Date: 11-7-15
 */


kola( 'kola.event.EventObject',
[ 'kola.lang.Class' ],
function( Class ) {
	
	return Class.create( {

		_init: function( object ) {
			if ( typeof object == 'object' && object !== null ) {
				for ( var name in object ) {
					this[ name ] = object[ name ];
				}
			}
		},

		stop: function() {
			this._preventDefault = true;
		},

		defaultPrevented: function() {
			return !!this._preventDefault;
		}
	} );
	
});