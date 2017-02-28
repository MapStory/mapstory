'use strict';

let home_page = require('../pages/home.po');
let wizard = require('../pages/icon_upload.po');

// var screenHelper = require('./screenHelper');

xdescribe('Icon Upload Wizard', function() {
	beforeEach(function(){
	});

	// // Take a screenshot automatically after each failing test.
	// afterEach(function() {
	// 	var passed = jasmine.getEnv().currentSpec.results().passed();
	// 	if (!passed) {
	// 		screenHelper.screenshot();
	// 	}
	// });

	it('> should be available to the user from the home page', function() {
		expect(home_page.isLoggedIn()).toBeTruthy();
		expect(home_page.navBar.isDisplayed()).toBe(true);
		home_page.menuCreate.click();
		expect(home_page.uploadIconsLink.waitReady()).toBeTruthy();
		home_page.uploadIconsLink.click();
	});

	it('> should upload svg icons', function() {
		expect(home_page.isLoggedIn()).toBeTruthy();
		expect(home_page.navBar.isDisplayed()).toBe(true);
		home_page.menuCreate.click();

		expect(home_page.uploadIconsLink.waitReady()).toBeTruthy();
		home_page.uploadIconsLink.click();

		let tagsInput = element(by.css('#id_tags'));
		expect(tagsInput.waitReady()).toBeTruthy();

		tagsInput.sendKeys('testtag01');

		// Send the file
		let filePath = wizard.getSVGPath();

		let fileInput = element(by.css('#id_svg'));
		expect(fileInput.waitReady()).toBeTruthy();

		fileInput.sendKeys(filePath);

		// Press send
		let uploadButton = element(by.css('#icon_submit_btn'));
		expect(uploadButton.waitReady()).toBeTruthy();

		uploadButton.click();

		// Expect success:
		let successAlert = element(by.css('.alert.alert-success'));
		expect(successAlert.waitReady()).toBeTruthy();

		successAlert.getText(function(text) {
			expect(text).toEqual(wizard.getSuccessText());
		});
	});

	it('> should reject non svg files', function() {
		expect(home_page.isLoggedIn()).toBeTruthy();
		expect(home_page.navBar.isDisplayed()).toBe(true);
		home_page.menuCreate.click();

		expect(home_page.uploadIconsLink.waitReady()).toBeTruthy();
		home_page.uploadIconsLink.click();

		var tagsInput = element(by.css('#id_tags'));
		expect(tagsInput.waitReady()).toBeTruthy();

		tagsInput.sendKeys('testtag00');

		// Send the file
		var filePath = wizard.getPNGPath();

		var fileInput = element(by.css('#id_svg'));
		expect(fileInput.waitReady()).toBeTruthy();

		fileInput.sendKeys(filePath);

		// Press send
		var uploadButton = element(by.css('#icon_submit_btn'));
		expect(uploadButton.waitReady()).toBeTruthy();

		uploadButton.click();

		// Expect no success:
		var successAlert = element(by.css('.alert.alert-success'));
		successAlert.isPresent(function(visible){
			expect(visible).toBe(false);
		});
	});
});
