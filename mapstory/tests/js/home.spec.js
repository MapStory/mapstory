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

	it('> should have an icon', function() {
		expect(page.loginIcon.isPresent()).toBeTruthy();
		expect(page.loginIcon.isDisplayed()).toBeTruthy();
	});

	/**
	 * Login Button
	 */
	it('> shows the Login Form', function() {
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
			// Click lgin
			page.loginIcon.click();
			expect(page.loginModal.waitReady()).toBe(true);
			expect(element(by.linkText('Log In')).isPresent()).toBe(true);
			expect(element(by.linkText('Sign Up')).isPresent()).toBe(true);
		});

		/**
		 * The Log in Form
		 */
		describe('> the "Log In" tab', function() {
			it('should show by default', function() {
				expect(page.loginIcon.isDisplayed()).toBeTruthy();
				// Click Login
				page.loginIcon.click();
				expect(page.loginForm.waitReady()).toBeTruthy();
				expect(elementFound(by.css('label[for="username"]'))).toBe(true);
			});

			it('> should have a close button', function() {
				expect(page.loginIcon.waitReady()).toBeTruthy();
				// Click Login
				page.loginIcon.click();
				expect(page.loginForm.waitReady()).toBeTruthy();
				expect(page.login_close_button.isDisplayed).toBeTruthy();
				// Click close
				page.login_close_button.click();
			});

			it('> should require a username and password', function() {
				expect(page.loginIcon.isDisplayed()).toBeTruthy();
				// Click login
				page.loginIcon.click();
				expect(page.loginForm.waitReady()).toBeTruthy();
				// Clock submit
				element(by.css('.login-auth-btn.btn.btn-md.btn-block')).click();
				// Expect error messages
				expect(element(by.css('#div_id_username.form-group.has-error')).isDisplayed()).toBeTruthy();
				expect(element(by.css('#div_id_password.form-group.has-error')).isDisplayed()).toBeTruthy();

			});

			xit('> should deny wrong credentials', function() {});

			xit('> should filter bad text input', function() {});
		});

		/**
		 * The Sign up Form
		 */
		describe('> The "Sign up" tab', function() {
			xit('> changes to the signup form when clicked', function() {

			});

			xit('> requires the user to agree the terms and conditions', function() {

			});

			it('> should register a new user', function() {
				expect(page.loginIcon.isDisplayed()).toBeTruthy();
				// Click login
				page.loginIcon.click();
				expect(page.loginForm.waitReady()).toBeTruthy();

				// Click signup
				var button = element(by.linkText('Sign Up'));
				expect(button.waitReady()).toBeTruthy();
				button.click();
				var userid = page.makeid(5);
				var usernameInput = element(by.css('#id_username'));
				var nameInput = element(by.css('#id_first_name'));
				var lastNameInput = element(by.css('#id_last_name'));
				var emailInput = element(by.css('#id_email'));
				var passwordInput = element(by.css('#id_password'));
				var confirmPasswordInput = element(by.css('#password_confirm'));
				// Set username
				expect(usernameInput.waitReady()).toBeTruthy();
				usernameInput.sendKeys(userid);
				// Set First Name
				nameInput.sendKeys('Moofasa');
				// Set Last name
				lastNameInput.sendKeys('Test');
				// Set email
				emailInput.sendKeys('josellausas+mapstory@gmail.com');
				// Set password
				passwordInput.sendKeys('testPassword2001!');
				// Confirm password
				confirmPasswordInput.sendKeys('testPassword2001!');
				// Accept terms
				var termsCheckbox = element(by.model('agreed'));
				termsCheckbox.click();
				// Click Join
				element(by.buttonText('Join')).click();
			});
		});

		it('> should log in admin', function() {
			if(page.userAvatar.isPresent() == true) {
				page.logout();
			}
			expect(page.loginIcon.waitReady()).toBeTruthy();
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

			it('should only upload svg files', function() {
				expect(page.isLoggedIn()).toBeTruthy();
				expect(page.navBar.isDisplayed()).toBe(true);
				page.menuCreate.click();

				expect(page.uploadIconsLink.waitReady()).toBeTruthy();
				page.uploadIconsLink.click();

				var tagsInput = element(by.css('#id_tags'));
				expect(tagsInput.waitReady()).toBeTruthy();

				tagsInput.sendKeys('testtag00');

				// Send the file
				var filePath = page.getPNGPath();

				var fileInput = element(by.css('#id_svg'));
				expect(fileInput.waitReady()).toBeTruthy();

				fileInput.sendKeys(filePath);

				// Press send
				var uploadButton = element(by.css('#icon_submit_btn'));
				expect(uploadButton.waitReady()).toBeTruthy();

				uploadButton.click();

				// Expect error message
				// var errorMessage = element(by.css());
				//
				// browser.wait(1000);
				// Button should still be there
				// expect(uploadButton.waitReady()).toBeTruthy();
			});

			it('should upload icons', function() {
				expect(page.isLoggedIn()).toBeTruthy();
				expect(page.navBar.isDisplayed()).toBe(true);
				page.menuCreate.click();

				expect(page.uploadIconsLink.waitReady()).toBeTruthy();
				page.uploadIconsLink.click();

				var tagsInput = element(by.css('#id_tags'));
				expect(tagsInput.waitReady()).toBeTruthy();

				tagsInput.sendKeys('testtag00');
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

		it('searches for things', function() {

		});

		it('filters bad test input', function() {

		});
	});

	xit('should logout', function() {

	});

	it('should change languages', function() {
		var languageDropdown = element(by.css('.lang.col-md-6.pull-right'));
		expect(languageDropdown.waitReady()).toBeTruthy();

		// Try to select spanish
		languageDropdown.$('[value="es"]').click();
	});
});
