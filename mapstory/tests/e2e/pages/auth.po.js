/**
 * Login Wizard Page Object
 * =========================
 */

'use strict';

const defaultTestUser = 'Moofasa';
const defaultLastName = 'Test';
const defaultEmail = 'testing@testmail.com';
const defaullTestPassword = 'testPassword2001!';

require('../tools/waitReady.js');

let AuthWizard = function() {

	this.loginIcon = element(by.css('.fa.fa-user'));
	this.loginModal = element(by.css('.modal-content'));
	this.navigationTabs = element(by.css('.nav.nav-tabs'));
	this.adminLink = element(by.linkText('admin'));
	this.logoutLink =  element(by.linkText('Log out'));
	this.login_close_button = element(by.css('.close.pull-right'));
	this.loginForm = element(by.css('form.form[action="/account/login/?next=/"]'));
	this.userAvatar = element(by.css('.nav-avatar'));
	this.usernameInput = this.loginForm.element(by.css('input.form-control[name="username"]'));
	this.passwordInput = this.loginForm.element(by.css('input.form-control[name="password"]'));
	this.loginButton = this.loginForm.element(by.partialButtonText('Sign in'));
	this.signUpButton = element(by.buttonText('Join MapStory'));

	// Getters
	this.getUsername = function() { return defaultTestUser; };
	this.getPassword = function() { return defaullTestPassword; };
	this.getEmail = function() { return defaultEmail; };
	this.getLastName = function() { return defaultLastName; };


	/**
	 * Gets the Auth Wizard
	 */
	this.get = function() {
		// Refresh page
		browser.get('http://192.168.56.151');
		browser.waitForAngular();

		let myself = this;

		// Logout if we are already authorized
		this.isLoggedIn().then(function(isAuth){
			if(isAuth == true) {
				myself.logout();
			}
			expect(myself.loginIcon.waitReady()).toBeTruthy();
			myself.loginIcon.click();
		});
	};


	/**
	 * Creates a random string of the length given.
	 *
	 * Defaults to length 5
	 *
	 * @param  {uint} length The length of the string to be generated
	 * @return {string} A random alpha-numeric string of the length
	 */
	this.makeid = function(length)
	{
		let text = '';
		const possible_characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		// Default to 5
		if (length < 1 ){
			length = 5;
		}

		// Builds a random string from the possible_characters
		for( let i=0; i < length; i++ )
			text += possible_characters.charAt(Math.floor(Math.random() * possible_characters.length));

		return text;
	};


	/**
	 * Logs in with user and password
	 * @param username The user's name
	 * @param password The password as a string (not the hash)
	 */
	this.login = function(username, password) {
		// Click the login Icon
		expect(this.loginIcon.waitReady()).toBeTruthy();
		this.loginIcon.click();

		if (username === null) { username = defaultTestUser; }
		if (password === null) { password = defaullTestPassword; }

		if(this.loginForm.isDisplayed() == true) {
			// Type username into box
			let usernameInput = this.loginForm.element(by.css('input.form-control[name="username"]'));
			usernameInput.sendKeys(username);

			// Type password into box
			let passwordInput = this.loginForm.element(by.css('input.form-control[name="password"]'));
			passwordInput.sendKeys(password);

			// Press the login button
			let loginButton = this.loginForm.element(by.partialButtonText('Sign in'));
			loginButton.click();
		}
	};


	/**
	 * Indicates if a user is logged in
	 *
	 * Note
	 * ----
	 * THIS RETURNS A PROMISE!
	 *
	 * Consider how protactor's `isDisplayed()` returns a promise.
	 * This means we must handle the promise like this:
	 *
	 * ```javascript
	 * page.isLoggedIn().then(function(userLoggedIn){
	 * 	if(userLoggedIn == true) {
	 * 		// Can asume he is logged in
	 * 	}
	 * });
	 * ```
	 * @return {Promise} A promise that indicates ifLoggedIn
	 */
	this.isLoggedIn = function() {
		return this.userAvatar.isDisplayed();
	};


	/**
	 * Logs out. Assumes this is called from the Home Page.
	 */
	this.logout = function() {
		let myself = this;
		this.isLoggedIn().then(function(loggedIn){
			if(loggedIn == true) {
				// Click the login button
				myself.adminLink.click();
				expect(myself.logoutLink.waitReady()).toBeTruthy();

				// Click the logout link
				myself.logoutLink.click();

				// Refresh page
				browser.get('http://192.168.56.151');
			}
		});
	};


	/**
	 * Signs up a new user
	 *
	 * If no data is provided, random is used.
	 * @param  {Object} userData {name, email, password}
	 */
	this.signUp = function(userData) {
		if(userData.name === null) {
			userData.name = defaultTestUser + '_' + this.makeid(7);
		}

		if(userData.email === null) {
			userData.email = userData.name + '@testing.com';
		}

		if(userData.password === null) {
			userData.password = defaullTestPassword;
		}
	};
};

module.exports = new AuthWizard();
