/**
 * Composer E2E Tests
 * ==================
 */

describe('Composer', function() {
	// Our home page object
	var page = null;

	beforeEach(function() {
		page = require('./composer.po.js');
		// page.get();
	});

	it('> should start logged in', function() {
		browser.get('http://192.168.56.151');
		browser.waitForAngular();
		var home = require('./home.po.js');
		home.login();
	});

	it('> should open URL', function() {
		// expect(browser.getTitle()).toEqual('MapStory');
	});

	xit('> should require login', function() {
		pending();
	});

	xit('> should be accessed from home', function(){
		browser.get('http://192.168.56.151');
		browser.waitForAngular();

		var home = require('./home.po.js');
		home.menuCreate.click();

		expect(home.composeStoryLink.waitReady()).toBeTruthy();
		home.composeStoryLink.click();
		browser.wait(4000);
		// browser.pause();
		// expect(browser.getCurrentUrl()).toContain(browser.baseUrl + '/maps/new');

	});

	it('> should display welcome modal', function() {

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

	it('> should go back to Home', function(){

	});

	it('> should give a tour', function() {

	});

	it('> should begin creating', function() {

	});
});
