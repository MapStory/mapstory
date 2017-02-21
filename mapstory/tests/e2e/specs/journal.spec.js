/**
 * Journal Spec tests
 */

'use strict';

require('../tools/waitReady.js');

describe('Journal Page', function(){
	let journal_page = require('../pages/journal.po');

	beforeEach(function(){
		journal_page.get();
	});

	it('should load correctly', function() {
		expect(browser.getTitle()).toEqual(journal_page.title);
		expect(journal_page.new_entry_button.waitReady()).toBeTruthy();
	});
});
