var queryUrl = "//en.wikipedia.org/w/api.php?origin=*&action=opensearch&limit=20&format=json&search=";
var q;

// thanks to Benjamin Gruenbaum (@benjamingr on GitHub) for
// big improvements here!
function run(gen) {
	var args = [].slice.call( arguments, 1), it;

	// initialize the generator in the current context
	it = gen.apply( this, args );

	// return a promise for the generator completing
	return Promise.resolve()
		.then( function handleNext(value){
			// run to the next yielded value
			var next = it.next( value );

			return (function handleResult(next){
				// generator has completed running?
				if (next.done) {
					return next.value;
				}
				// otherwise keep going
				else {
					return Promise.resolve( next.value )
						.then(
							// resume the async loop on
							// success, sending the resolved
							// value back into the generator
							handleNext,

							// if `value` is a rejected
							// promise, propagate error back
							// into the generator for its own
							// error handling
							function handleErr(err) {
								return Promise.resolve(
									it.throw( err )
								)
								.then( handleResult );
							}
						);
				}
			})(next);
		} );
}

function reqData(q) {
	return fetch(
		queryUrl + q
	).then(function(response) {
       return response.json();
   });
}

function *main() {
	try {
		var data = yield reqData(q);
		console.log( data );
	}
	catch (err) {
		console.error( err );
	}
}

function searchWikipedia() {
  q = document.getElementById('query').value;

	run( main );
}
