'use strict';
require('../tools/waitReady.js');

// This is an example of how to use image-diff tests

let PixDiff  = require('pix-diff');
let homePage = require('../pages/home.po');

describe('Home page image check', () => {

	beforeEach(() => {
		browser.get('http://192.168.56.151');
		browser.waitForAngular();

	});

	it('should have pix-diff installed', () => {
		expect(browser.pixDiff).toBeTruthy();
	});

	it('should match the home page', () => {
		homePage.logout();
		browser.pixDiff.checkPage('homePage').then(
			result => {
				// 5 means identical!
				expect(result.code).toEqual(PixDiff.RESULT_IDENTICAL);
			}
		);

		let navbar = element(By.id('navbar'));
		browser.pixDiff.checkRegion(navbar, 'navbar').then(
			result => {
				expect(result.code).toEqual(PixDiff.RESULT_IDENTICAL);
			}
		);
	});

	it('should match login modal', () => {
		homePage.logout();
		homePage.loginIcon.click();
		let loginModal = element(By.id('loginModal'));
		loginModal.waitReady();
		browser.sleep(1000);
		// Scroll to top
		browser.executeScript('window.scrollTo(0,0);').then(function () {
			browser.pixDiff.checkRegion(loginModal, 'loginModal').then(
				result => {
					expect(result.code).toEqual(PixDiff.RESULT_IDENTICAL);
				}
			);
		});
	});
});


