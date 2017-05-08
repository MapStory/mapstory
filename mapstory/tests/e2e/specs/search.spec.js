'use strict';

require('../tools/waitReady.js');

let wait_times = require('../tools/wait_times');
const deafaultWindowHeight = 900;
const defaultWindoWidth = 1400;
let constants = require('../tools/constants');

describe('Search', function() {

	let search = null;

	beforeEach(function(){
		// Fetch Home
		// Search bar cares about window size.
		browser.driver.manage().window().setSize(defaultWindoWidth, deafaultWindowHeight);
		browser.get(constants.baseURL);
		search = require('../pages/search.po');
		browser.waitForAngular();
	});
	
	it('> should show search bar even if window size is 400 x 600', function() {
		browser.driver.manage().window().setSize(400, 600);
		browser.get(constants.baseURL);
		browser.waitForAngular();
		search.textInput.isDisplayed().then(function(isVisible){
			expect(isVisible).toBe(true);
		});
	});

	it('> should show the search bar when window size is 1440 x 900', function() {
		expect(search.searchButton.waitReady()).toBeTruthy();
		search.searchButton.click();
	});

	it('> should search', function() {
		expect(search.searchButton.waitReady()).toBeTruthy();
		search.searchButton.click();
		browser.sleep(wait_times['search']);

		// Expect the url to change to search api
		browser.getCurrentUrl().then(function(newURL){
			expect(newURL.indexOf('/search/') >= 0 ).toBeTruthy();
		});
	});

	it('> should find stories', function() {

	});

	it('> should find layers', function() {

	});

	xit('> should find all users', function() {
		search.searchFor('');
		expect(search.storyTellerTab.waitReady()).toBeTruthy();
		search.storyTellerTab.click();

		browser.sleep(wait_times['search']);
		expect(search.resultsContainer.waitReady()).toBeTruthy();

		// Refresh search objects
		search = require('../pages/search.po');
		expect(search.searchResults.count()).toBeTruthy();
	});


	xit('> should search for admin', function() {
		search.searchFor('admin');

		browser.sleep(wait_times.search);
		expect(search.resultsContainer.waitReady()).toBeTruthy();

		// Refresh search objects
		search = require('../pages/search.po');
		expect(search.searchResults.count()).toEqual(1);

		search.searchResults.get(0).getText().then(function(text){
			expect(text.indexOf('admin') >= 0).toBeTruthy();
		});
	});

	xit('> should find a user by name', function() {
		search.searchFor('Moofasa');
		expect(search.storyTellerTab.waitReady()).toBeTruthy();
		search.storyTellerTab.click();

		browser.sleep(wait_times.search);
		expect(search.resultsContainer.waitReady()).toBeTruthy();

		// Refresh search objects
		search = require('../pages/search.po');
		expect(search.searchResults.count()).toEqual(1, 'Expected to find 1 result!');

		if(search.searchResults.count() > 1){
			// Test user
			search.searchResults.get(0).getText().then(function(text){
				expect(text.indexOf('Moofasa')).toBeTruthy();
			});
		}
	});
});
