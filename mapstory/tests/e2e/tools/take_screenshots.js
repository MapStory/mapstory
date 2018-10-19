'use strict';

let homePage = require('../pages/home.po');
let images_page = require('../pages/images.po');

let enabled = false;
let constants = require("../tools/constants");

/**
 * A tool for generating screenshots
 */
if(enabled) {
	describe('Screenshot Bot', () => {

		beforeEach(() => {
			// browser.driver.manage().window().maximize();
			browser.driver.manage().window().setSize(1440, 800);
			browser.driver.manage().window().setPosition(0, 0);
			browser.get(constants.baseURL);
			browser.waitForAngular();
			browser.sleep(1000);
		});

		it('saves the homepage', () => {
			// Scroll to top
			browser.executeScript('window.scrollTo(0,0);').then(function () {
				browser.sleep(1500);
				browser.pixDiff.savePage('homePage');
			});
		});

		it('saves all the little pieces', () => {

			// Scroll to top
			browser.executeScript('window.scrollTo(0,0);').then(function () {
				browser.pixDiff.saveRegion(images_page.navbar, 'navbar');
			});

		});

		it('saves the login modal', () => {
			homePage.loginIcon.click();
			images_page.loginModal.waitReady();
			browser.sleep(1000);
			// Scroll to top
			browser.executeScript('window.scrollTo(0,0);').then(function () {
				browser.pixDiff.saveRegion(images_page.loginModal, 'loginModal');
			});
		});
	});
}





