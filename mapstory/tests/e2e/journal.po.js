/**
 * Journal Page Object
 * ===================
 */

'use strict';

require('./waitReady.js');

var JournalPageObject = function() {
	this.title = 'MapStory';
	this.new_entry_button = element(by.partialLinkText('write an entry'));

	this.get = function() {
		browser.get('http://192.168.56.151/journal');
		browser.waitForAngular();
	};
};

module.exports = new JournalPageObject();
