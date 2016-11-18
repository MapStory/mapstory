/**
 * Home Page Object
 * ================
 *
 * Describes the homepage object and its elements
 */
'use strict';

require('./waitReady.js');

const testLayerFile = '/Users/pp/Desktop/lewisandclarktrail.csv';

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
	this.step2 = element(by.css('.row.step.ng-isolate-scope.current'));
	this.step3 = element(by.css('.row.step.ng-isolate-scope.current[title="Title"]'));
	this.step4 = element(by.css('section[title="Time"]'));
	this.step5 = element(by.css('section[title="Editing"]'));
	this.step6 = element(by.css('section[title="Import"]'));
	this.importLayerLink = element(by.linkText("Import StoryLayer"));
	this.createLayerLink = element(by.linkText("Create StoryLayer"));
	this.uploadIconsLink = element(by.linkText("Upload Icons"));
	this.composeStoryLink = this.navBar.element(by.linkText("Compose Story"));

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

	this.doStep1 = function() {
		//----- Start Step 1 ---------
		expect(this.step1.waitReady()).toBeTruthy();

		var title = this.step1.element(by.css('.step-title'));
		title.getText().then(function(text) {
			expect(text).toEqual('Before we begin');
		});

		var button = this.step1.element(by.buttonText("Let's Begin!"));
		expect(button.isDisplayed()).toBeTruthy();
		button.click();
		//------- End Step 1 -------------
	};

	this.doStep2 = function() {
		//------- Start Step 2 -----------
		var selectFileButton = element(by.css('[for="my-file-selector"]'));
		expect(selectFileButton.waitReady()).toBeTruthy();

		// Firefox needs the element to be visible for interaction with the element to work
		browser.executeAsyncScript(function(callback) {
			document.querySelectorAll('#my-file-selector')[0].style.display = 'inline';
			callback();
		});

		// Now you can upload.
		element(by.css('#my-file-selector')).sendKeys(testLayerFile);

		var status = element(by.css('[ng-show="layer.state"]'));
		expect(status.waitReady()).toBeTruthy();

		status.getText().then(function(text){
			expect(text).toEqual('Status: UPLOADED');
		});

		var nextButton = this.step2.element(by.css('[value="Next Step"]'));
		expect(nextButton.waitReady()).toBeTruthy();
		nextButton.click();
		//------- End Step 2 -----------
	};

	this.doStep3 = function() {
		//------- Start Step 3 -----------
		var nextButton3 = this.step3.element(by.css('[value="Next Step"]'));
		expect(nextButton3.waitReady()).toBeTruthy();
		nextButton3.click();
		//------- End Step 3 -----------
	};

	this.doStep4 = function() {
		//------- Start Step 4 -----------
		// var selectDate = element(by.id('start_date'));
		var selectDate = element(by.model('layer.configuration_options.start_date'));
		expect(selectDate.waitReady()).toBeTruthy();
		selectDate.$('[value="e_date"]').click();

		// var dateSelection = selectDate.element(by.css('option'));
		// expect(dateSelection.waitReady()).toBeTruthy();
		// dateSelection.click();

		// Expect the thing to be selected!
		// var selected = selectDate.element(by.css('option[value="e_date"][selected="selected"]'));
		// expect(selected.isPresent()).toBeTruthy();

		var nextButton4 = this.step4.element(by.css('button[value="Next Step"]'));
		expect(nextButton4.waitReady()).toBeTruthy();
		nextButton4.click();
		//------- End Step 4 -----------
	};

	this.doStep5 = function() {
		// Step 5
		var nextButton5 = this.step5.element(by.css('button[value="Next Step"]'));
		expect(nextButton5.waitReady()).toBeTruthy();
		nextButton5.click();
	};

	this.doStep6 = function() {
		// Step 6
		var importButton = this.step6.element(by.buttonText('Import Layer'));
		expect(importButton.waitReady()).toBeTruthy();
		importButton.click();

		// Wait about 7 secs
		browser.driver.sleep(7233);

		var finishButton = this.step6.element(by.buttonText('View Layer'));
		expect(finishButton.waitReady()).toBeTruthy();

		var stepTitle = this.step6.$$('.step-title').first();
		stepTitle.getText(function(text){
			expect(text).toEqual('Congratulations! Click below to view your new Layer.');
		});

		finishButton.click();
	};

};

module.exports = new home_page();
