/**
 * Journal Spec tests
 */

'use strict';

require('./waitReady.js');

describe('Journal Page', function(){
	var journal_page = require('./journal.po');

	beforeEach(function(){
		journal_page.get();
	});

	it('should load correctly', function() {
		expect(browser.getTitle()).toEqual(journal_page.title);
		expect(journal_page.new_entry_button.waitReady()).toBeTruthy();
	});
});
