/**
 * Home Page Object
 * ================
 *
 * Describes the homepage object and its elements
 */
'use strict';

require('./waitReady.js');

var home_page = function() {
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
	this.navBar = element(by.css('#navbar'));
	this.menuCreate = element(by.linkText('Create'));
	this.step1 = element(by.css('[title="Check Your Data"]'));

	/**
	 * Signs in a user
	 * @param  {string} user     The username
	 * @param  {string} password The password
	 * @return {bool}          True if successful
	 */
	this.login = function(user, password){
		if(this.loginForm.isDisplayed() == true) {
			var usernameInput = this.loginForm.element(by.css('input.form-control[name="username"]'));
			usernameInput.sendKeys(user);
			var passwordInput = this.loginForm.element(by.css('input.form-control[name="password"]'));
			passwordInput.sendKeys(password);
			var loginButton = this.loginForm.element(by.partialButtonText('Sign in'));
			loginButton.click();
			return true;
		} else {
			return false;
		}
	};

	this.logout = function() {
		if(this.isLoggedIn() == true) {
			// Need to log out
			this.adminLink.click();
			expect(this.logoutLink.waitReady()).toBeTruthy();
			this.logoutLink.click();
			browser.get('http://192.168.56.151');
		}
	};

	/**
	 * Indicates if a user is logged in
	 * @return {Boolean} True if logged in
	 */
	this.isLoggedIn = function() {
		return this.userAvatar.isDisplayed();
	};
};

module.exports = new home_page();
