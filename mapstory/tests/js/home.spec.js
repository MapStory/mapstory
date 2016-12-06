/**
 * Mapstory E2E Tests
 * =============================
 * Uses protractor for testing the content served to the browser.
 *
 * How to run E2E tests
 * --------------------
 * 1. Install Protractor: http://www.protractortest.org/
 * 2. Start the webriver: webdriver-manager start
 * 3. Run the tests with `../runE2ETests.sh`
 *
 * Notes
 * -----
 * This is very handy for finding the right selectors: https://github.com/andresdominguez/elementor
 * After install run: `elementor http://192.168.56.151` to start the tool
 */
'use strict';

require('./waitReady.js');

function elementFound(locator) {
	return element(locator).isPresent();
}

const wait_times = require('./wait_times');

/**
 * Waits for an element to be visible
 * @param  {element} element The element to wait for
 */
function waitFor(element) {
	// browser.wait(EC.visibilityOf(element), 5000);
	expect(element.waitReady()).toBeTruthy();
}

/**
 * Mapstory Home Page
 */
describe('Mapstory Home', function() {
	// Our home page object
	var page = require('./home.po');
	var auth = require('./auth.po');

	beforeEach(function() {
		// Fetch the site
		// browser.driver.manage().window().maximize();
		browser.get('http://192.168.56.151');
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
		waitFor(page.loginForm);
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
		var exceptionValue = element(by.css('exception_value'));
		expect(exceptionValue.isPresent()).toBe(false);

		// Return to normal
		page.logout();

		// Fetch the site
		browser.get('http://192.168.56.151');
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
			expect(element(by.linkText('Explore')).isDisplayed()).toBe(true);
			element(by.linkText('Explore')).click();
			expect(elementFound(by.css('#content-search'))).toBe(true);
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
				expect(page.importLayerLink.isDisplayed()).toBe(true);
				expect(page.createLayerLink.isDisplayed()).toBe(true);
				expect(page.uploadIconsLink.isDisplayed()).toBe(true);
				expect(page.composeStoryLink.isDisplayed()).toBe(true);
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
					var closeButton = element(by.css('i.fa.fa-times.pointer.import-wizard-icon'));
					expect(closeButton.isDisplayed()).toBe(true);
					closeButton.click();
				});

				/**
				 * Step 1
				 */
				describe('> Step 1', function() {
					it('> should complete step 1', function() {
						page.uploadLayer_Step1();
					});

					xit('> can close the form', function() {

					});

					xit('> highlights the correct step', function() {

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

					it('> can go to next step', function() {

					});

					it('> can close form', function() {

					});

					it('> highlights the correct step', function() {

					});

					it('> should not continue without file', function() {

					});
				});

				/**
				 * Step 3
				 */
				describe('> Step 3', function() {
					xit('should edit title', function() {

					});

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
					xit('should set community settings', function() {

					});

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

				xit('> should show summary when succesful', function() {

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
					page.uploadLayer_Step6();
					browser.sleep(wait_times['metadata_load']);
					var titleInput = element(by.css('#id_title'));
					var categoryDropdown = element(by.css('#id_category'));
					var summaryText = element(by.css('#id_abstract'));
					var languageDropdown = element(by.css('#id_language'));
					var dataSourceText = element(by.css('#id_distribution_url'));
					var dataQualityText = element(by.css('#id_data_quality_statement'));
					var purposeText = element(by.css('#id_purpose'));
					var isPublishedCheckbox = element(by.css('#id_is_published'));
					expect(titleInput.waitReady()).toBeTruthy();
					expect(categoryDropdown.waitReady()).toBeTruthy();
					expect(summaryText.waitReady()).toBeTruthy();
					expect(languageDropdown.waitReady()).toBeTruthy();
					expect(dataSourceText.waitReady()).toBeTruthy();
					expect(dataQualityText.waitReady()).toBeTruthy();
					expect(purposeText.waitReady()).toBeTruthy();
					expect(isPublishedCheckbox.waitReady()).toBeTruthy();
				});
			});
		});
	});

	/**
	 * The search bar
	 */
	xdescribe('> The "Search bar"', function() {
		it('> should show', function() {

		});

		it('> has a button', function() {

		});

		it('> searches for things', function() {

		});

		it('> filters bad test input', function() {

		});
	});

	xit('> should logout', function() {

	});

	xit('> should change languages', function() {
		var languageDropdown = element(by.css('.lang.col-md-6.pull-right'));
		expect(languageDropdown.waitReady()).toBeTruthy();

		// Try to select spanish
		languageDropdown.$('[value="es"]').click();
	});

	it('> should get here', function() {
		expect(true).toBe(true);
	});
});
