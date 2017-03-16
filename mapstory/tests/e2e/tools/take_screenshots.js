'use strict';

let homePage = require('../pages/home.po');

let enabled = true;

/**
 * A tool for generating screenshots
 */
if(enabled) {
	describe('Screenshot Bot', () => {
		beforeEach(() => {
			browser.get('http://192.168.56.151');
			browser.waitForAngular();
		});

		it('saves the homepage', () => {
			browser.pixDiff.savePage('homePage');
		});

		it('saves all the little pieces', () => {
			let navbar = element(By.id('navbar'));
			browser.pixDiff.saveRegion(navbar, 'navbar');
		});

		it('saves the login modal', () => {
			homePage.loginIcon.click();
			let loginModal = element(By.id('loginModal'));
			loginModal.waitReady();
			browser.sleep(1000);
			// Scroll to top
			browser.executeScript('window.scrollTo(0,0);').then(function () {
				browser.pixDiff.saveRegion(loginModal, 'loginModal');
			});
		});
	});
}





