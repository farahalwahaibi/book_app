'use strict';

console.log( 'js is alive!!' );

$( '#updateForm' ).hide();
$( '#updateButton' ).on( 'click', function () {
  $( '#updateForm' ).toggle();
} );
