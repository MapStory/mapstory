/**
 * Login Wizard Page Object
 * =========================
 */

'use strict';

const defaultTestUser = 'test_user';
const defaullTestPassword = 'test1234';

require('./waitReady.js');

var AuthWizard = function() {
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


	/**
	 * Creates a random alpha-numeric string of the length given.
	 *
	 * Defaults to length 5 if none given
	 *
	 * @param  {uint} length The length of the string to be generated
	 * @return {string}        A random alpha-numeric string of the length
	 */
	this.makeid = function(length)
	{
		var text = '';
		var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		// Default to 5
		if (length < 1 ){
			length = 5;
		}

		for( var i=0; i < length; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	};

	this.get = function() {
		// Refresh page
		browser.get('http://192.168.56.151');
		browser.waitForAngular();

		this.isLoggedIn().then(function(isAuth){
			if(isAuth == true) {
				this.logout();
			}
			expect(this.loginIcon.waitReady()).toBeTruthy();
			this.loginIcon.click();
		});

	};

	this.getUsername = function() {
		return defaultTestUser;
	};

	this.getPassword = function() {
		return defaullTestPassword;
	};


	this.login = function(username, password) {
		expect(this.loginIcon.waitReady()).toBeTruthy();
		this.loginIcon.click();

		if (username == null) {
			username = defaultTestUser;
		}

		if (password === null) {
			password = defaullTestPassword;
		}

		if(this.loginForm.isDisplayed() == true) {
			// Sets username
			var usernameInput = this.loginForm.element(by.css('input.form-control[name="username"]'));
			usernameInput.sendKeys(username);

			// Sets password
			var passwordInput = this.loginForm.element(by.css('input.form-control[name="password"]'));
			passwordInput.sendKeys(password);

			// Push login button
			var loginButton = this.loginForm.element(by.partialButtonText('Sign in'));
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
		this.isLoggedIn().then(function(loggedIn){
			// Click the login button
			if(loggedIn == true) {
				this.adminLink.click();
				expect(this.logoutLink.waitReady()).toBeTruthy();

				// Click the logout link
				this.logoutLink.click();

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
	this.createUser = function(userData) {
		if(userData.name === null) {
			var randomName = defaultTestUser + '_' + this.makeid(5);
			userData.name = randomName;
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
