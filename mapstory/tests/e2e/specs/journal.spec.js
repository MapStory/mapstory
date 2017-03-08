/**
 * Journal Spec tests
 */

'use strict';

require('../tools/waitReady.js');
let screenshot_help = require('../tools/screenshot_helper.js');

// Take screenshots on error
screenshot_help.setup();

describe('Journal Page', function(){
	let journal_page = require('../pages/journal.po');

	beforeEach(function(){
		journal_page.get();
	});

	it('should load correctly', function() {
		expect(browser.getTitle()).toEqual(journal_page.title);
		expect(journal_page.new_entry_button.waitReady()).toBeTruthy();
	});

	it('can write a new entry', () => {
		let entry_title = 'Testing journal posts 12';
		journal_page.make_new_entry(entry_title, 'Random Content', true);
	});
});
