/**
 * Search Page Object
 * =========================
 */

'use strict';

require('../tools/waitReady.js');
let wait_times = require('../tools/wait_times');

let Search = function() {
	this.searchForm = element(by.css('.search-bar'));
	this.textInput = element(by.css('[placeholder="Quick Search"]'));
	this.searchButton = element(by.css('button[type="submit"]'));
	this.storyTellerTab = element(by.partialLinkText('Search for Storytellers'));
	this.resultsContainer = element(by.css('.storyteller-results'));
	this.searchResults = element.all(by.repeater('item in results | filter:itemFilter'));

	this.searchFor = function(searchString) {
		expect(this.searchButton.waitReady()).toBeTruthy();

		// Send the search text
		this.textInput.sendKeys(searchString);

		this.searchButton.click();
		browser.sleep(wait_times['search']);

		// Expect the url to change to search api
		browser.getCurrentUrl().then(function(newURL){
			expect(newURL.indexOf('/search/') >= 0 ).toBeTruthy();
		});
	};
};

module.exports = new Search();
