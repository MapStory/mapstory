'use strict';

var home_page = null;
var wizard = null;

describe('Icon Upload Wizard', function() {
	beforeEach(function(){
		home_page = require('./home.po');
		wizard = require('./icon_upload.po');
	});

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

		var tagsInput = element(by.css('#id_tags'));
		expect(tagsInput.waitReady()).toBeTruthy();

		tagsInput.sendKeys('testtag01');

		// Send the file
		var filePath = wizard.getSVGPath();

		var fileInput = element(by.css('#id_svg'));
		expect(fileInput.waitReady()).toBeTruthy();

		fileInput.sendKeys(filePath);

		// Press send
		var uploadButton = element(by.css('#icon_submit_btn'));
		expect(uploadButton.waitReady()).toBeTruthy();

		uploadButton.click();

		// Expect success:
		var successAlert = element(by.css('.alert.alert-success'));
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
