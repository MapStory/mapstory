'use strict';

/**
 * User auth tests
 * ================
 */


let EC = protractor.ExpectedConditions;
require('../tools/waitReady.js');
let constants = require('../tools/constants');

describe('User auth', function() {

	let auth = require('../pages/auth.po');

	beforeEach(function(){
		// Fetch Home
		browser.get(constants.baseURL);
		browser.waitForAngular();
	});

	/**
	 * Login Button
	 */
	it('Should display a Login Form', function(done) {

		auth.loginIcon.isDisplayed().then(function(displayed){

			if(displayed === false) {
				auth.logout();
			}

			expect(auth.loginIcon.waitReady()).toBeTruthy();

			auth.loginIcon.click();
			expect(auth.loginForm.waitReady()).toBeTruthy();

			// Jasmine has problems with async. Need to manually specify were done here.
			done();
		});
	});

	/**
	 * The Auth Form
	 */
	describe('The "Login Form"', function() {

		beforeEach(function() {});

		it('should have "Log In" and "Sign up" tabs', function() {
			expect(auth.loginIcon.isDisplayed()).toBeTruthy();
			expect(auth.loginIcon.waitReady()).toBeTruthy();

			// Click login
			auth.loginIcon.click();
			expect(auth.loginModal.waitReady()).toBe(true);
			expect(element(by.linkText('Log In')).isPresent()).toBe(true);
			expect(element(by.linkText('Sign Up')).isPresent()).toBe(true);
		});

		/**
		 * The Log in Form
		 */
		describe('> The "Log In" tab', function() {

			beforeEach(function() {});

			it('should be shown by default', function() {
				expect(auth.loginIcon.isDisplayed()).toBeTruthy();

				// Click Login
				auth.loginIcon.click();
				expect(auth.loginForm.waitReady()).toBeTruthy();

				let usernameLabel = element(by.css('label[for="username"]'));
				expect(usernameLabel.waitReady()).toBeTruthy();
			});

			it('> should have a close button', function() {

				expect(auth.loginIcon.waitReady()).toBeTruthy();

				// Click Login
				auth.loginIcon.click();
				expect(auth.loginForm.waitReady()).toBeTruthy();
				expect(auth.login_close_button.isDisplayed).toBeTruthy();

				// Click close
				auth.login_close_button.click();
			});

			it('> should require a username and password', function() {

				expect(auth.loginIcon.waitReady()).toBeTruthy();

				// Click login
				auth.loginIcon.click();
				expect(auth.loginForm.waitReady()).toBeTruthy();

				// Click submit
				element(by.css('.login-auth-btn.btn.btn-md.btn-block')).click();

				// Expect error messages
				let username_error = element(by.css('#error_id_username_1'));
				expect(username_error.waitReady()).toBeTruthy();
				expect(username_error.isDisplayed()).toBeTruthy();
				expect(element(by.css('#error_id_password_1')).isDisplayed()).toBeTruthy();

			});
		});

		/**
		 * The Sign up Form
		 */
		describe('> The "Sign up" tab', function() {
			beforeEach(function() {});

			it('> should register a new user', function() {
				expect(auth.loginIcon.isDisplayed()).toBeTruthy();
				// Click login
				auth.loginIcon.click();
				expect(auth.loginForm.waitReady()).toBeTruthy();

				// Click signup
				let button = element(by.linkText('Sign Up'));
				expect(button.waitReady()).toBeTruthy();
				button.click();
				let userid = 'tester_' + auth.makeid(7);
				let usernameInput = element(by.css('#id_username'));
				let nameInput = element(by.css('#id_first_name'));
				let lastNameInput = element(by.css('#id_last_name'));
				let emailInput = element(by.css('#id_email'));
				let passwordInput = element(by.css('#id_password'));
				let confirmPasswordInput = element(by.css('#password_confirm'));
				// Set username
				expect(usernameInput.waitReady()).toBeTruthy();
				usernameInput.sendKeys(userid);
				// Set First Name
				nameInput.sendKeys(auth.getUsername());
				// Set Last name
				lastNameInput.sendKeys(auth.getLastName());
				// Set email
				emailInput.sendKeys(auth.getEmail());
				// Set password
				passwordInput.sendKeys(auth.getPassword());
				// Confirm password
				confirmPasswordInput.sendKeys(auth.getPassword());
				// Accept terms
				let termsCheckbox = element(by.model('agreed'));
				termsCheckbox.click();
				// Click Join
				auth.signUpButton.click();
			});
		});

		xit('> should log in admin', function() {
			if(auth.userAvatar.isPresent() == true) {
				auth.logout();
			}
			expect(auth.loginIcon.waitReady()).toBeTruthy();
			auth.loginIcon.click();

			expect(auth.loginForm.isPresent()).toBe(true);
			browser.wait(EC.visibilityOf(auth.loginForm), 5000);
			expect(auth.loginForm.isDisplayed()).toBeTruthy();

			// Input username
			expect(auth.usernameInput.isPresent()).toBe(true);
			auth.usernameInput.sendKeys('admin');

			// Input password
			expect(auth.passwordInput.isPresent()).toBe(true);
			auth.passwordInput.sendKeys('admin');

			// Press the login button
			expect(auth.loginButton.isPresent()).toBe(true);
			auth.loginButton.click();

			// Should show the avatar after login
			browser.get(constants.baseURL);
			expect(auth.userAvatar.waitReady()).toBeTruthy();
		});
	});
});
