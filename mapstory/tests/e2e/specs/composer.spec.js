/**
 * Composer E2E Tests
 * ==================
 */
'use strict';

let page = require('../pages/composer.po.js');
let home = require('../pages/home.po.js');
let wait_times = require('../tools/wait_times.js');

describe('Composer', function() {
	// Our home page object
	beforeEach(function() {
		// Fetch Home
		browser.ignoreSynchronization = true;
	});

	it('> should start logged in', function() {
		browser.get('http://192.168.56.151');
		home.login('admin', 'admin');
	});

	xit('> should require login', function() {

	});

	it('> should be navigated to from home', function(done){
		browser.get('http://192.168.56.151');
		expect(home.menuCreate.waitReady()).toBeTruthy();
		// Click create
		home.menuCreate.click();
		expect(home.composeStoryLink.waitReady()).toBeTruthy();

		// Click compose
		home.composeStoryLink.click();
		browser.sleep(wait_times['composer_tour_modal']);
		expect(page.go_back_home.waitReady()).toBeTruthy();
		done();
	});

	it('> should display welcome modal', function() {
		page.get();
		expect(page.compose_story.waitReady()).toBeTruthy();
		expect(page.take_tour.waitReady()).toBeTruthy();
		expect(page.go_back_home.waitReady()).toBeTruthy();
	});

	it('> should navigate back to home', function() {
		page.get();
		page.go_back_home.click();

		browser.ignoreSynchronization = false;
		expect(home.userAvatar.waitReady()).toBeTruthy();
	});

	// @TODO: Update this test. The behavior has changed.
	xit('> should give a tour', function() {
		/*
		element(by.id("newPlan")).click().then(function () {
	        browser.getAllWindowHandles().then(function (handles) {
	            newWindowHandle = handles[1]; // this is your new window
	            browser.switchTo().window(newWindowHandle).then(function () {
	                // fill in the form here
	                expect(browser.getCurrentUrl()).toMatch(/\/url/);
	            });
	        });
	    });
		 */
		page.get();
		expect(page.take_tour.waitReady()).toBeTruthy();
		page.take_tour.click();

		expect(page.tour_number.waitReady()).toBeTruthy();
		page.tour_number.getText().then(function(text){
			expect(text).toEqual('1');
		});

		// NEXT
		expect(page.tour_next_button.waitReady()).toBeTruthy();
		page.tour_next_button.click();

		expect(page.tour_number.waitReady()).toBeTruthy();
		page.tour_number.getText().then(function(text){
			expect(text).toEqual('2');
		});

		expect(page.tour_next_button.waitReady()).toBeTruthy();
		page.tour_next_button.click();
	});

	it('> should set properties in properties modal', function(done) {
		page.get();
		expect(page.compose_story.waitReady()).toBeTruthy();
		page.compose_story.click();
		expect(page.map_properties.waitReady()).toBeTruthy();
		expect(page.map_properties_title_text.waitReady()).toBeTruthy();
		expect(page.map_properties_summary_text.waitReady()).toBeTruthy();
		expect(page.map_properties_category_dropdown.waitReady()).toBeTruthy();
		expect(page.map_properties_tags_text.waitReady()).toBeTruthy();
		expect(page.map_properties_location_dropdown.waitReady()).toBeTruthy();
		expect(page.map_properties_save_button.waitReady()).toBeTruthy();

		var storyTitle = page.makeRandomTitle(5);

		// Fill up properties form
		page.map_properties_title_text.sendKeys(storyTitle);
		page.map_properties_summary_text.sendKeys('A short summary for the test mapstory. Testing 123 456');
		page.map_properties_tags_text.sendKeys('test, testing-tag');
		page.map_properties_save_button.click();

		// Page title should be the same
		page.story_title.getText().then(function(text){
			expect(text).toBe(storyTitle);
		});


		// element.all(by.repeater('chapter in mapstories.chapters')).then(function(chapter){
			// expect(chapter[0].waitReady()).toBeTruthy();
			// chapter[0].$('a').click();
			// done();
		// });

		let chaptersList = $('#chaptersList');
		expect(chaptersList.waitReady()).toBeTruthy();

		let chapterLink = chaptersList.$('.menuItem.ng-scope').$('a');
		expect(chapterLink.waitReady()).toBeTruthy();
		chapterLink.click();
		// browser.pause();

		let chapterInfo = $('#chapterInfoButton');
		expect(chapterInfo.waitReady()).toBeTruthy();
		done();
	});

	it('> should begin creating', function() {
		page.get();
		expect(page.compose_story.waitReady()).toBeTruthy();
		page.compose_story.click();

		expect(page.map_properties.waitReady()).toBeTruthy();
	});
});
