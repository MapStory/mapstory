/**
 * Composer Page Object
 * ====================
 */
'use strict';

require('./waitReady.js');

var composer = function() {
	this.get = function() {
		browser.get('http://192.168.56.151/maps/new');
	};
};

module.exports = new composer();
