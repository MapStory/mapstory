'use strict';
require('../tools/waitReady.js');
// let PixDiff = require('pix-diff');


describe('Example page', () => {

	beforeEach(() => {
		browser.get('http://192.168.56.151');
		browser.waitForAngular();
	});

	it('should match the page', () => {
		expect(browser.pixDiff).toBeTruthy();

		// browser.pixDiff.savePage('savedImage');
		browser.pixDiff.checkPage('homePage').then(
			result => {
				// 5 means identical!
				expect(result.code).toEqual(5);
			}
		);

		
	});

	// it('should match the page title', () => {
	// 	expect(browser.pixDiff.checkRegion(element(by.css('h1')), 'exampleRegion')).toPass();
	// });
	//
	// it('should not match the page title', () => {
	// 	expect(browser.pixDiff.checkRegion(element(by.cc('a')), 'exampleRegion')).not.toPass();
	// });
});


