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
require('./waitReady.js');

function elementFound(locator) {
	return element(locator).isPresent();
}


var EC = protractor.ExpectedConditions;

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
	var page = null;

	beforeEach(function() {
		// Fetch the site
		browser.get('http://192.168.56.151');
		page = require('./home.po');
		browser.waitForAngular();
		// Fetch the elements
	});

	xit('should check for "error #111"', function() {
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

	it('should have a title', function() {
		expect(browser.getTitle()).toEqual('MapStory');
	});

	it('should have an icon', function() {
		expect(page.loginIcon.isPresent()).toBeTruthy();
		expect(page.loginIcon.isDisplayed()).toBeTruthy();
	});

	/**
	 * Login Button
	 */
	it('shows the Login Form', function() {
		page.loginIcon.isDisplayed().then(function(displayed){
			if(displayed == false) {
				page.logout();
			}

			waitFor(page.loginIcon);
			page.loginIcon.click();
			waitFor(page.loginForm);
		});
	});
	/**
	 * The Auth Form
	 */
	describe('> The "Auth Form"', function() {
		it('should display "Log In" and "Sign up" tabs', function() {
			expect(page.loginIcon.isDisplayed()).toBeTruthy();
			expect(page.loginIcon.waitReady()).toBeTruthy();
			page.loginIcon.click();
			expect(page.loginModal.waitReady()).toBe(true);
			// expect(page.navigationTabs.waitReady()).toBe(true);
			expect(element(by.linkText("Log In")).isPresent()).toBe(true);
			expect(element(by.linkText("Sign Up")).isPresent()).toBe(true);
		});

		/**
		 * The Log in Form
		 */
		describe('> the "Log In" tab', function() {
			it('should show by default', function() {
				expect(page.loginIcon.isDisplayed()).toBeTruthy();
				page.loginIcon.click();
				expect(page.loginForm.waitReady()).toBeTruthy();
				expect(elementFound(by.css('label[for="username"]'))).toBe(true);
			});

			it('should have a close button', function() {
				expect(page.loginIcon.isDisplayed()).toBeTruthy();
				page.loginIcon.click();
				expect(page.loginForm.waitReady()).toBeTruthy();
				expect(page.login_close_button.isDisplayed).toBeTruthy();
				page.login_close_button.click();
				// expect(element(by.css('label[for="username"]')).isDisplayed()).toBeFalsy();
			});

			it('should require a username and password', function() {
				expect(page.loginIcon.isDisplayed()).toBeTruthy();
				page.loginIcon.click();
				expect(page.loginForm.waitReady()).toBeTruthy();
				element(by.css('.login-auth-btn.btn.btn-md.btn-block')).click();
				expect(element(by.css('#div_id_username.form-group.has-error')).isDisplayed()).toBeTruthy();
				expect(element(by.css('#div_id_password.form-group.has-error')).isDisplayed()).toBeTruthy();

			});

			xit('should deny wrong credentials', function() {});

			xit('should filter bad text input', function() {});
		});

		/**
		 * The Sign up Form
		 */
		describe('> The "Sign up" tab', function() {
			it('changes to the signup form when clicked', function() {
				expect(page.loginIcon.isDisplayed()).toBeTruthy();
				page.loginIcon.click();
				expect(page.loginForm.waitReady()).toBeTruthy();

				var button = element(by.linkText('Sign Up'));
				expect(button.waitReady()).toBeTruthy();
				expect(button.isDisplayed()).toBeTruthy();
				button.click();

				expect(elementFound(by.css('#join-mapstory-button'))).toBe(true);
				// var signupButton = element(by.partialButtonText('Sign in'));
				// signupButton.click();
			});

			xit('requires the user to agree the terms and conditions', function() {

			});
		});

		it('should log in admin', function() {

			page.loginIcon.click();
			expect(page.loginForm.isPresent()).toBe(true);
			browser.wait(EC.visibilityOf(page.loginForm), 5000);
			expect(page.loginForm.isDisplayed()).toBeTruthy();

			// Input username
			expect(page.usernameInput.isPresent()).toBe(true);
			page.usernameInput.sendKeys('admin');

			// Input password
			expect(page.passwordInput.isPresent()).toBe(true);
			page.passwordInput.sendKeys('admin');

			// Press the login button
			expect(page.loginButton.isPresent()).toBe(true);
			page.loginButton.click();

			// Should show the avatar after login
			browser.get('http://192.168.56.151');
			waitFor(page.userAvatar);
			expect(page.userAvatar.isDisplayed()).toBe(true);
		});
	});

	/**
	 * Navigation Bar
	 */
	describe('> The "Navigation Menu"', function() {
		it('should navigate to "Explore"', function() {
			expect(element(by.linkText('Explore')).isDisplayed()).toBe(true);
			element(by.linkText('Explore')).click();
			expect(elementFound(by.css('#content-search'))).toBe(true);
		});

		/**
		 * Create
		 */
		describe('> "Create" option', function() {
			beforeEach(function() {});

			it('has a dropdown', function() {
				expect(page.isLoggedIn()).toBeTruthy();
				expect(page.navBar.isDisplayed()).toBe(true);
				page.menuCreate.click();
				expect(element(by.linkText("Upload Layer")).isDisplayed()).toBe(true);
				expect(element(by.linkText("Create Layer")).isDisplayed()).toBe(true);
				expect(element(by.linkText("Upload Icons")).isDisplayed()).toBe(true);

				var composeStory = page.navBar.element(by.linkText("Compose Story"));
				expect(composeStory.isDisplayed()).toBe(true);
			});



			/**
			 * Upload Layer Form
			 */
			describe('> Upload Layer form', function() {

				beforeEach(function() {
					element(by.linkText('Create')).click();
					var uploadLayerLink = element(by.linkText("Upload Layer"));
					uploadLayerLink.click();
				});

				it("has a 'Close' button", function() {
					var closeButton = element(by.css('i.fa.fa-times.pointer.import-wizard-icon'));
					expect(closeButton.isDisplayed()).toBe(true);
					closeButton.click();
				});

				/**
				 * Step 1
				 */
				describe("> Step 1", function() {
					it("> should have a Let's Begin button", function() {
						expect(page.step1.waitReady()).toBeTruthy();

						var title = page.step1.element(by.css('.step-title'));
						title.getText().then(function(text) {
							expect(text).toEqual('Before we begin');
						});

						var button = page.step1.element(by.buttonText("Let's Begin!"));
						expect(button.isDisplayed()).toBeTruthy();
					});


					xit("> can close the form", function() {

					});

					xit("> highlights the correct step", function() {

					});
				});

				/**
				 * Step 2
				 */
				xdescribe("> Step 2", function() {
					it("follows step 1", function() {

					});

					it("can go back", function() {

					});

					it("can select a file", function() {

					});

					it("can go to next step", function() {

					});

					it("can close form", function() {

					});

					it("highlights the correct step", function() {

					});

					it("should not continue without file", function() {

					});

					it("should upload a file", function() {

					});
				});

				/**
				 * Step 3
				 */
				xdescribe("> Step 3", function() {
					it("should edit title", function() {

					});

					it("should continue to next step", function() {

					});
				});

				/**
				 * Step 4
				 */
				xdescribe("> Step 4", function() {
					it("should configure time", function() {

					});
				});

				/**
				 * Step 5
				 */
				xdescribe("> Step 5", function() {
					it("should set community settings", function() {

					});
				});

				/**
				 * Step 6
				 */
				xdescribe("> Step 6", function() {
					it("should import layer", function() {

					});
				});

				xit('should show summary when succesful', function() {

				});
			});

			xit("should show 'Create Layer'", function() {

			});

			xit("should show 'Upload Icons'", function() {

			});

			xit("should show 'Compose Story'", function() {

			});
		});

		it('should navigate to "Get Started"', function() {
			expect(element(by.linkText('Get Started')).isDisplayed()).toBe(true);
		});

		it('should navigate to "Journal"', function() {
			expect(element(by.linkText('Journal')).isDisplayed()).toBe(true);
		});
	});

	/**
	 * The search bar
	 */
	xdescribe('> The "Search bar"', function() {
		it("should show", function() {

		});

		it("has a button", function() {

		});

		it("searches for things", function() {

		});

		it("filters bad test input", function() {

		});
	});

	xit('should logout', function() {

	});
});
