/**
 * Composer E2E Tests
 * ==================
 */
'use strict';

describe('Composer', function() {
	// Our home page object
	var page = null;

	beforeEach(function() {
		page = require('./composer.po.js');
	});

	it('> should start logged in', function() {
		browser.get('http://192.168.56.151');
		browser.waitForAngular();
		var home = require('./home.po.js');
		home.login();
	});

	xit('> should require login', function() {

	});

	xit('> should be accessed from home', function(){
		browser.get('http://192.168.56.151');
		browser.waitForAngular();

		var home = require('./home.po.js');
		home.menuCreate.click();

		expect(home.composeStoryLink.waitReady()).toBeTruthy();
		home.composeStoryLink.click();
		browser.sleep(4000);
	});

	xit('> should display welcome modal', function() {
		browser.get('http://192.168.56.151/maps/new?tour');
		// browser.waitForAngular();
		// browser.wait(4000);
		// browser.pause();
		// var welcomeTour = element(by.css('#welcomeTour'));
		// browser.wait(1000);
		// expect(welcomeTour.waitReady()).toBeTruthy();
		// expect(welcomeTour.isPresent()).toBeTruthy();
		// var ok = welcomeTour.element(by.linkText('Compose Story'));
		// ok.click();
	});

	xit('> should go back to Home', function(){

	});

	xit('> should give a tour', function() {

	});

	xit('> should begin creating', function() {

	});
});
