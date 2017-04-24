/**
 * Mapstory E2E Tests
 * =============================
 * Uses protractor for testing the content served to the browser.
 *
 * How to run E2E tests
 * --------------------
 * 1. Install Protractor: http://www.protractortest.org/
 * 2. Start the webriver: webdriver-manager start
 * 3. Run the tests with `./runE2ETests.sh`
 *
 * Notes
 * -----
 * You can use this tool for finding the right selectors: https://github.com/andresdominguez/elementor
 * After install run: `elementor http://192.168.56.151` to start the tool
 */
'use strict';

require('../tools/waitReady.js');
const wait_times = require('../tools/wait_times');
let constants = require("../tools/constants");

/**
 * Mapstory Home Page
 */
describe('Mapstory Home', function() {
	// Our home page object
	let page = require('../pages/home.po');
	let auth = require('../pages/auth.po');
	let explore_page = require('../pages/explore.po');

	beforeEach(function() {
		// Fetch the site
		browser.get(constants.baseURL);
		browser.waitForAngular();
	});

	/**
	 * Error 111 tests
	 */
	xit('> should check for "error #111"', function() {
		// Wait for login icon to show
		expect(page.loginIcon.isDisplayed()).toBeTruthy();
		page.loginIcon.click();

		// Wait for login form
		expect(page.loginForm.waitReady()).toBeTruthy();
		page.loginForm.isDisplayed().then(function(displayed){
			expect(displayed).toBe(true);
		});

		// Input username
		page.usernameInput.isDisplayed().then(function(displayed){
			expect(displayed).toBe(true);
		});
		page.usernameInput.sendKeys('admin');

		// Input password
		page.passwordInput.isDisplayed().then(function(displayed){
			expect(displayed).toBe(true);
		});
		page.passwordInput.sendKeys('admin');

		// Press the login button
		expect(page.loginButton.isPresent()).toBe(true);
		page.loginButton.click();

		// Checks for Error #111
		let exceptionValue = element(by.css('exception_value'));
		expect(exceptionValue.isPresent()).toBe(false);

		// Return to normal
		page.logout();

		// Fetch the site
		browser.get(constants.baseURL);
		browser.waitForAngular();

		// Fetch the elements
		page = require('./home.po');
	});

	it('> should have a title', function() {
		expect(browser.getTitle()).toEqual('MapStory');
	});

	it('> should be authorized', function(){
		auth.isLoggedIn().then(function(isLogged){
			expect(isLogged).toBeTruthy();
		});
	});

	/**
	 * Navigation Bar
	 */
	describe('> The "Navigation Menu"', function() {
		it('> should navigate to "Explore"', function() {
			// Click the link
			expect(page.menu_explore.waitReady()).toBeTruthy();
			page.menu_explore.click();

			// Title should be explore
			expect(browser.getTitle()).toEqual(explore_page.title);
		});

		it('> should navigate to "Get Started"', function() {
			expect(element(by.linkText('Get Started')).isDisplayed()).toBe(true);
		});

		it('> should navigate to "Journal"', function() {
			expect(element(by.linkText('Journal')).isDisplayed()).toBe(true);
		});

		/**
		 * Create
		 */
		describe('> "Create" menu option', function() {
			beforeEach(function() {});

			it('> has a dropdown', function() {
				expect(page.isLoggedIn()).toBeTruthy();
				expect(page.navBar.isDisplayed()).toBe(true);
				page.menuCreate.click();

				// The links inside the dropdown
				expect(page.importLayerLink.waitReady()).toBe(true);
				expect(page.createLayerLink.waitReady()).toBe(true);
				expect(page.uploadIconsLink.waitReady()).toBe(true);
				expect(page.composeStoryLink.waitReady()).toBe(true);
			});

			it('> should show "Create Layer"', function() {
				expect(page.isLoggedIn()).toBeTruthy();
				expect(page.navBar.isDisplayed()).toBe(true);
				page.menuCreate.click();

				expect(page.createLayerLink.waitReady()).toBeTruthy();
				page.createLayerLink.click();
			});

			describe('> Create Layer Wizard', function() {
				it('> step 1', function() {
					// Open the Create menu
					expect(page.isLoggedIn()).toBeTruthy();
					expect(page.navBar.isDisplayed()).toBe(true);
					page.menuCreate.click();

					// Click the create story layer link
					expect(page.createLayerLink.waitReady()).toBeTruthy();
					page.createLayerLink.click();

					page.createLayer_Step1();
				});

				it('> step 2', function() {
					// Open the Create menu
					expect(page.isLoggedIn()).toBeTruthy();
					expect(page.navBar.isDisplayed()).toBe(true);
					page.menuCreate.click();

					// Click the create story layer link
					expect(page.createLayerLink.waitReady()).toBeTruthy();
					page.createLayerLink.click();

					page.createLayer_Step1();
					page.createLayer_Step2();
				});

				it('> step 3', function() {
					// Open the Create menu
					expect(page.isLoggedIn()).toBeTruthy();
					expect(page.navBar.isDisplayed()).toBe(true);
					page.menuCreate.click();

					// Click the create story layer link
					expect(page.createLayerLink.waitReady()).toBeTruthy();
					page.createLayerLink.click();

					page.createLayer_Step1();
					page.createLayer_Step2();
					page.createLayer_Step3();
				});

				it('> step 4', function() {
					// Open the Create menu
					expect(page.isLoggedIn()).toBeTruthy();
					expect(page.navBar.isDisplayed()).toBe(true);
					page.menuCreate.click();

					// Click the create story layer link
					expect(page.createLayerLink.waitReady()).toBeTruthy();
					page.createLayerLink.click();

					page.createLayer_Step1();
					page.createLayer_Step2();
					page.createLayer_Step3();
					page.createLayer_Step4();
				});

				it('> step 5', function() {
					// Open the Create menu
					expect(page.isLoggedIn()).toBeTruthy();
					expect(page.navBar.isDisplayed()).toBe(true);
					page.menuCreate.click();

					// Click the create story layer link
					expect(page.createLayerLink.waitReady()).toBeTruthy();
					page.createLayerLink.click();

					page.createLayer_Step1();
					page.createLayer_Step2();
					page.createLayer_Step3();
					page.createLayer_Step4();
					page.createLayer_Step5();
				});

				it('> step 6', function() {
					// Open the Create menu
					expect(page.navBar.isDisplayed()).toBe(true);
					page.menuCreate.click();

					// Click the create story layer link
					expect(page.createLayerLink.waitReady()).toBeTruthy();
					page.createLayerLink.click();

					page.createLayer_Step1();
					page.createLayer_Step2();
					page.createLayer_Step3();
					page.createLayer_Step4();
					page.createLayer_Step5();
					page.createLayer_Step6();
				});
			});

			it('> should create layer', function() {
				// Open the Create menu
				expect(page.isLoggedIn()).toBeTruthy();
				expect(page.navBar.isDisplayed()).toBe(true);
				page.menuCreate.click();

				// Click the create story layer link
				expect(page.createLayerLink.waitReady()).toBeTruthy();
				page.createLayerLink.click();

				// Do the thing
				page.createStoryLayer();
			});

			it('> should show "Upload Icons"', function() {
				expect(page.isLoggedIn()).toBeTruthy();
				expect(page.navBar.isDisplayed()).toBe(true);
				page.menuCreate.click();

				expect(page.uploadIconsLink.waitReady()).toBeTruthy();
				page.uploadIconsLink.click();
			});


			it('> should show "Compose Story"', function() {
				expect(page.isLoggedIn()).toBeTruthy();
				expect(page.navBar.isDisplayed()).toBe(true);
				page.menuCreate.click();

				expect(page.composeStoryLink.waitReady()).toBeTruthy();
				page.composeStoryLink.click();
			});

			/**
			 * Import Layer Form
			 */
			describe('> Import Layer form', function() {

				beforeEach(function() {
					element(by.linkText('Create')).click();
					page.importLayerLink.click();
				});

				it('> has a "Close button"', function() {
					let closeButton = element(by.css('i.fa.fa-times.pointer.import-wizard-icon'));
					expect(closeButton.waitReady()).toBeTruthy();
					closeButton.click();
				});

				/**
				 * Step 1
				 */
				describe('> Step 1', function() {
					it('> should complete step 1', function() {
						page.uploadLayer_Step1();
					});
				});

				/**
				 * Step 2
				 */
				describe('> Step 2', function() {
					it('should complete step 2', function() {
						page.uploadLayer_Step1();
						page.uploadLayer_Step2();
					});
				});

				/**
				 * Step 3
				 */
				describe('> Step 3', function() {
					it('> should complete step 3', function() {
						page.uploadLayer_Step1();
						page.uploadLayer_Step2();
						page.uploadLayer_Step3();
					});
				});

				/**
				 * Step 4
				 */
				describe('> Step 4', function() {
					it('should complete step 4', function() {
						page.uploadLayer_Step1();
						page.uploadLayer_Step2();
						page.uploadLayer_Step3();
						page.uploadLayer_Step4();
					});
				});

				/**
				 * Step 5
				 */
				describe('> Step 5', function() {
					it('> should complete step 5', function() {
						page.uploadLayer_Step1();
						page.uploadLayer_Step2();
						page.uploadLayer_Step3();
						page.uploadLayer_Step4();
						page.uploadLayer_Step5();
					});

				});

				/**
				 * Step 6
				 */
				describe('> Step 6', function() {
					it('> should complete step 6', function() {
						page.uploadLayer_Step1();
						page.uploadLayer_Step2();
						page.uploadLayer_Step3();
						page.uploadLayer_Step4();
						page.uploadLayer_Step5();
						page.uploadLayer_Step6();
					});
				});

			});

			describe('> Layer Edit Metadata', function() {
				beforeEach(function() {
					element(by.linkText('Create')).click();
					page.importLayerLink.click();
					page.uploadLayer_Step1();
					page.uploadLayer_Step2();
					page.uploadLayer_Step3();
					page.uploadLayer_Step4();
					page.uploadLayer_Step5();
				});

				it('> Can edit metadata', function() {
					// Complete last step
					page.uploadLayer_Step6();
					browser.sleep(wait_times['metadata_load']);

					// Click 'Update Metadata'
					let update_metadata_button = element(by.partialButtonText('Update Metadata'));
					expect(update_metadata_button.waitReady()).toBeTruthy();
					update_metadata_button.click();
					browser.sleep(2000);

					//Expect things to show up on metadata edit
					let titleInput = element(by.css('#id_title'));
					let categoryDropdown = element(by.css('#id_category'));
					let summaryText = element(by.css('#id_abstract'));
					let languageDropdown = element(by.css('#id_language'));
					let dataSourceText = element(by.css('#id_distribution_url'));
					let dataQualityText = element(by.css('#id_data_quality_statement'));
					let purposeText = element(by.css('#id_purpose'));
					let isPublishedCheckbox = element(by.css('#id_is_published'));

					expect(titleInput.waitReady()).toBeTruthy();
					expect(categoryDropdown.waitReady()).toBeTruthy();
					expect(summaryText.waitReady()).toBeTruthy();
					expect(languageDropdown.waitReady()).toBeTruthy();
					expect(dataSourceText.waitReady()).toBeTruthy();
					expect(dataQualityText.waitReady()).toBeTruthy();
					expect(purposeText.waitReady()).toBeTruthy();
					expect(isPublishedCheckbox.waitReady()).toBeTruthy();

					// Click 'Is Published'
					let is_published_checkbox = element(by.css('#id_is_published'));
					expect(is_published_checkbox.waitReady()).toBeTruthy();
					is_published_checkbox.click();

					// Click 'Save'
            		let saveButton = element(by.partialButtonText('Save'));
            		saveButton.click();
				});
			});
		});
	});


	xit('> should change languages', function() {
		let languageDropdown = element(by.css('.lang.col-md-6.pull-right'));
		expect(languageDropdown.waitReady()).toBeTruthy();

		// Try to select spanish
		languageDropdown.$('[value="es"]').click();
	});
});
