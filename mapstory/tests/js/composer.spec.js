/**
 * Composer E2E Tests
 * ==================
 */
'use strict';

var page = require('./composer.po.js');
var home = require('./home.po.js');
var wait_times = require('./wait_times.js');

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

	it('> should be navigated to from home', function(){
		browser.get('http://192.168.56.151');
		home.menuCreate.click();
		expect(home.composeStoryLink.waitReady()).toBeTruthy();
		home.composeStoryLink.click();
		browser.sleep(wait_times['composer_tour_modal']);
		expect(page.go_back_home.waitReady()).toBeTruthy();
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

	it('> should give a tour', function() {
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

		// TODO: FIX TOUR!!!

	});

	it('> should begin creating', function() {
		page.get();
		expect(page.compose_story.waitReady()).toBeTruthy();
		page.compose_story.click();

		expect(page.map_properties.waitReady()).toBeTruthy();
		// page.map_properties_header.getText().then(function(text){
			// browser.sleep(200);
			// expect(text).toEqual('Story Properties');
		// });


	});
});
