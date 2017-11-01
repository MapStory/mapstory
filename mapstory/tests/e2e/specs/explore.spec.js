/**
 * Explore Page e2e Tests
 */
'use strict';

require('../tools/waitReady.js');

describe('Explore page', function() {
	let explore_page = require('../pages/explore.po');

	beforeEach(function() {
		explore_page.get();
	});

	xit('> loads correctly', function() {
		// TODO: Dynamically check for the title
		expect(browser.getTitle()).toEqual(explore_page.title);
		// expect(explore_page.storyteller_search_tab.waitReady()).toBeTruthy();
		// expect(explore_page.search_bar.waitReady()).toBeTruthy();
		// expect(explore_page.search_button.waitReady()).toBeTruthy();
		// expect(explore_page.filter_all.waitReady()).toBeTruthy();
		// expect(explore_page.filter_mapstory.waitReady()).toBeTruthy();
	});
});
