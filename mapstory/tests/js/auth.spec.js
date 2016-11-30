'use strict';

/**
 * User auth tests
 * ================
 */

var auth;
var EC = protractor.ExpectedConditions;
require('./waitReady.js');


describe('User auth', function() {
	beforeEach(function(){
		// Fetch Home
		browser.get('http://192.168.56.151');
		auth = require('./auth.po');
		browser.waitForAngular();
	});

	/**
	 * Login Button
	 */
	it('> should display a Login Form', function() {
		auth.loginIcon.isDisplayed().then(function(displayed){
			if(displayed == false) {
				auth.logout();
			}
			expect(auth.loginIcon.waitReady()).toBeTruthy();
			auth.loginIcon.click();
			expect(auth.loginForm.waitReady()).toBeTruthy();
		});
	});

	/**
	 * The Auth Form
	 */
	describe('> The "Login Form"', function() {
		it('should have "Log In" and "Sign up" tabs', function() {
			expect(auth.loginIcon.isDisplayed()).toBeTruthy();
			expect(auth.loginIcon.waitReady()).toBeTruthy();
			// Click lgin
			auth.loginIcon.click();
			expect(auth.loginModal.waitReady()).toBe(true);
			expect(element(by.linkText('Log In')).isPresent()).toBe(true);
			expect(element(by.linkText('Sign Up')).isPresent()).toBe(true);
		});

		/**
		 * The Log in Form
		 */
		describe('> The "Log In" tab', function() {
			it('should be shown by default', function() {
				expect(auth.loginIcon.isDisplayed()).toBeTruthy();

				// Click Login
				auth.loginIcon.click();
				expect(auth.loginForm.waitReady()).toBeTruthy();
				var usernameLabel = element(by.css('label[for="username"]'));
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
				expect(auth.loginIcon.isDisplayed()).toBeTruthy();
				// Click login
				auth.loginIcon.click();
				expect(auth.loginForm.waitReady()).toBeTruthy();
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
			pending('TODO').it('> requires the user to agree the terms and conditions', function() {

			});

			it('> should register a new user', function() {
				expect(auth.loginIcon.isDisplayed()).toBeTruthy();
				// Click login
				auth.loginIcon.click();
				expect(auth.loginForm.waitReady()).toBeTruthy();

				// Click signup
				var button = element(by.linkText('Sign Up'));
				expect(button.waitReady()).toBeTruthy();
				button.click();
				var userid = auth.makeid(5);
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
				var termsCheckbox = element(by.model('agreed'));
				termsCheckbox.click();
				// Click Join
				element(by.buttonText('Join')).click();
			});
		});

		it('> should log in admin', function() {
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
			browser.get('http://192.168.56.151');
			expect(auth.userAvatar.waitReady()).toBeTruthy();
		});
	});

	xit('> should login admin', function() {
		auth.login('admin', 'admin');

		auth.isLoggedIn().then(function(loggedIn) {
			expect(loggedIn).toBeTruthy();
		});
	});

	xit('> should logout', function() {
		auth.logout();
	});

	xit('> should error on incorrect passwords', function() {
	});
});
