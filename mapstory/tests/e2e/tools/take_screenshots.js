'use strict';

let homePage = require('../pages/home.po');

let enabled = false;

if(enabled === true) {
	describe('Screenshot Bot', () => {
		beforeEach(() => {
			browser.get('http://192.168.56.151');
			browser.waitForAngular();
		});

		xit('saves the homepage', () => {
			browser.pixDiff.savePage('homePage');
		});

		xit('saves all the little pieces', () => {
			let navbar = element(By.id('navbar'));
			browser.pixDiff.saveRegion(navbar, 'navbar');
		});

		xit('saves the login modal', () => {
			homePage.loginIcon.click();
			let loginModal = element(By.id('loginModal'));
			loginModal.waitReady();
			browser.sleep(1000);
			browser.pixDiff.saveRegion(loginModal, 'loginModal');
		});

	});
}





