/**
 * Explore Page e2e Tests
 */
'use strict';

require('../tools/waitReady.js');

describe('Explore page', function() {
	var explore_page = require('../pages/explore.po');

	beforeEach(function() {
		explore_page.get();
	});

	it('> loads correctly', function() {
		expect(browser.getTitle()).toEqual(explore_page.title);
		// Should have a content tab
		expect(explore_page.content_search_tab.waitReady()).toBeTruthy();
		// Should have a Storyteller tab
		expect(explore_page.storyteller_search_tab.waitReady()).toBeTruthy();
		// Should have a search bar and button
		expect(explore_page.search_bar.waitReady()).toBeTruthy();
		expect(explore_page.search_button.waitReady()).toBeTruthy();
		// Should have search filters
		expect(explore_page.filter_all.waitReady()).toBeTruthy();
		expect(explore_page.filter_mapstory.waitReady()).toBeTruthy();
		// expect(explore_page.filter_layer.waitReady()).toBeTruthy();

		// Should have sort buttons
		// expect(explore_page.sort_popular.waitReady()).toBeTruthy();
		// expect(explore_page.sort_newest.waitReady()).toBeTruthy();
	});
});
