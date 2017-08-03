var ul = document.getElementById('results');
var queryUrl = "//en.wikipedia.org/w/api.php?origin=*&action=opensearch&limit=20&format=json&search=";
var q;

// Helper functions blatantly copied from https://scotch.io/tutorials/how-to-use-the-javascript-fetch-api-to-get-data
function createNode(element) {
	return document.createElement(element); // Create the type of element you pass in the parameters
}

function append(parent, el) {
	return parent.appendChild(el); // Append the second parameter(element) to the first one
}

// Based on the generator as taught in YDKJS - Async & Performance - Generators (https://github.com/getify/You-Dont-Know-JS)

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
	return fetch(queryUrl + q)
	.then(function(response) {
       return response.json();
   });
}

function *main() {
	try {
		var data = yield reqData(q);
		console.log( data );
		// we don't need the first element so i starts at 1
		for (var i = 1; i < data[1].length - 1; i++) {
			// create an unordered list programmatically, adapted from https://scotch.io/tutorials/how-to-use-the-javascript-fetch-api-to-get-data
			var li = createNode('li'),
					span = createNode('span');
			span.innerHTML = `<a href="${data[3][i]}" target="_blank">${data[1][i]}</a>: ${data[2][i]}`;
		  append(li, span);
		  append(ul, li);
		}
	}
	catch (err) {
		console.error( err );
	}
}

function searchWikipedia() {
	// clear current results from unordered list (https://stackoverflow.com/a/3955238 option 2)
	var myNode = document.getElementById("results");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	// grab query keyword
  q = document.getElementById('query').value;
	// run *main to search wikipedia with the query keyword and create an unordered list
	run( main );
}
