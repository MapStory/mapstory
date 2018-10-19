'use strict';

function define(name, value) {
	Object.defineProperty(exports, name, {
		value:      value,
		enumerable: true
	});
}

if(process.env.DOCKER) {
	define('baseURL', 'https://docker');
} else {
	define('baseURL', 'http://docker');
}
