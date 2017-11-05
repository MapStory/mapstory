/**
 * Journal Spec tests
 */

'use strict';

require('../tools/waitReady.js');
let make_id = require('../tools/make_id');
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

	xit('can write a new entry', () => {
		// Create a new entry
		let entry_title = 'Testing journal post ' + make_id(4);
		let content_id = make_id(12);
		let entry_content = 'Some random content to test: ' + content_id;
		journal_page.make_new_entry(entry_title, entry_content, true);

		// The entry should now be displayed
		journal_page.get();
		let foundTitle = false;
		// Searches all the jorunal titles for the test title
		element.all(by.css('h1.blog-title')).each(function(element) {
			element.getText().then(function(text) {
				if(text == entry_title) {
					foundTitle = true;
					return true;
				}
			});
		}).then( () => {
			expect(foundTitle).toBe(true);
		});

		// The correct content should be displayed
		element.all(by.partialLinkText(entry_title)).each(function(element) {
			element.getText().then(function(text) {
				if(text == entry_title) {
					// Click the link
					element.click();
				}
			});
		}).then( () => {
			browser.waitForAngular();
			// The Content ID should be inside the content

			let content = element(by.css('.col-lg-10.col-xs-6.blog-content.bl'));
			content.getText().then((text) => {
				expect(text).toContain(content_id);
			});

			// Should be able to comment
			let comment_id = make_id(3);
			let test_comment = 'This is a test comment: ' + comment_id;
			journal_page.comment_box.sendKeys(test_comment);

			let post_comment_button = element(by.buttonText('Post'));
			post_comment_button.click();
		});
	});
});
