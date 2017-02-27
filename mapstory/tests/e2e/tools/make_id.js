'use strict';

/**
 * Makes a random stirng to be used as an ID
 * @param length The length of the string
 * @returns {string} An alpha-numeric string
 */
let make_id = function(length) {
	let text = '';
	const possible_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	// Sets the default length
	if( length === null){ length = 7; }

	// Builds the string
	for( let i=0; i < length; i++ )
		text += possible_chars.charAt(Math.floor(Math.random() * possible_chars.length));

	return text;
};

module.exports = make_id;
