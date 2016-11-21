/**
 * Composer Page Object
 * ====================
 */
'use strict';

require('./waitReady.js');

var composer = function() {
	this.startComposingLink = element(by.css("#start-composing"));

	this.get = function() {
		browser.get('http://192.168.56.151');
		browser.waitForAngular();
	};
};

module.exports = new composer();
