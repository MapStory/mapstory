/**
 * Home Page Object
 * ================
 *
 * Describes the homepage object and its elements
 */
'use strict';

require('./waitReady.js');
var path = require('path');
// Upload paths need to be absolute or error.
const testLayerFileRelative = '../test_assets/lewisandclarktrail.csv';
const testLayerFile = path.resolve(__dirname, testLayerFileRelative);
var wait_times = require('./wait_times');
var auth = require('./auth.po');


/**
 * Home Page Object
 */
var home_page = function() {
	this.loginIcon = element(by.css('[data-target="#loginModal"]'));
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
	this.menu_explore = element(by.linkText('Explore'));
	this.step1 = element(by.css('[title="Check Your Data"]'));
	this.step2 = element(by.css('.row.step.ng-isolate-scope.current'));
	this.step3 = element(by.css('.row.step.ng-isolate-scope.current[title="Title"]'));
	this.step4 = element(by.css('section[title="Time"]'));
	this.step5 = element(by.css('section[title="Editing"]'));
	this.step6 = element(by.css('section[title="Import"]'));
	this.importLayerLink = element(by.linkText('Import StoryLayer'));
	this.createLayerLink = element(by.linkText('Create StoryLayer'));
	this.uploadIconsLink = element(by.linkText('Upload Icons'));
	this.composeStoryLink = this.navBar.element(by.linkText('Compose Story'));

	/**
	 * Signs in a user
	 * @param  {string} user     The username
	 * @param  {string} password The password
	 * @return {bool}          True if successful
	 */
	this.login = function(user, password){
		if(this.loginForm.isDisplayed() == true) {
			// Sets username
			var usernameInput = this.loginForm.element(by.css('input.form-control[name="username"]'));
			usernameInput.sendKeys(user);

			// Sets password
			var passwordInput = this.loginForm.element(by.css('input.form-control[name="password"]'));
			passwordInput.sendKeys(password);

			// Push login button
			var loginButton = this.loginForm.element(by.partialButtonText('Sign in'));
			loginButton.click();

			return true;
		} else {
			return false;
		}
	};


	/**
	 * Logs out the user
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
			length = 7;
		}

		for( var i=0; i < length; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	};


	/**
	 * Completes Upload Layer - Step 1
	 */
	this.uploadLayer_Step1 = function() {
		expect(this.step1.waitReady()).toBeTruthy();

		var title = this.step1.element(by.css('.step-title'));
		title.getText().then(function(text) {
			expect(text).toEqual('Before we begin');
		});

		var button = this.step1.element(by.buttonText('Let\'s Begin!'));
		expect(button.isDisplayed()).toBeTruthy();
		button.click();
	};


	/**
	 * Completes Upload Layer - Step 2
	 */
	this.uploadLayer_Step2 = function() {
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
	};


	/**
	 * Completes Upload Layer - Step 3
	 */
	this.uploadLayer_Step3 = function() {
		var nextButton3 = this.step3.element(by.css('[value="Next Step"]'));
		expect(nextButton3.waitReady()).toBeTruthy();
		nextButton3.click();
	};


	/**
	 * Completes Upload Layer - Step 4
	 */
	this.uploadLayer_Step4 = function() {
		var selectDate = element(by.model('layer.configuration_options.start_date'));
		expect(selectDate.waitReady()).toBeTruthy();
		selectDate.$('[value="e_date"]').click();

		var nextButton4 = this.step4.element(by.css('button[value="Next Step"]'));
		expect(nextButton4.waitReady()).toBeTruthy();
		nextButton4.click();
	};


	/**
	 * Completes Upload Layer - Step 5
	 */
	this.uploadLayer_Step5 = function() {
		// Step 5
		var nextButton5 = this.step5.element(by.css('button[value="Next Step"]'));
		expect(nextButton5.waitReady()).toBeTruthy();
		nextButton5.click();
	};


	/**
	 * Completes Upload Layer - Step 6
	 */
	this.uploadLayer_Step6 = function() {
		var importButton = this.step6.element(by.buttonText('Import Layer'));
		expect(importButton.waitReady()).toBeTruthy();
		importButton.click();

		browser.driver.sleep(wait_times['layerUpload']);

		var finishButton = this.step6.element(by.buttonText('View Layer'));
		expect(finishButton.waitReady()).toBeTruthy();

		var stepTitle = this.step6.$$('.step-title').first();
		stepTitle.getText(function(text){
			expect(text).toEqual('Congratulations! Click below to view your new Layer.');
		});

		finishButton.click();
	};


	/**
	 * Create Layer - Step 1
	 */
	this.createLayer_Step1 = function() {
		var layerName = element(by.model('layer.configuration_options.name'));
		expect(layerName.waitReady()).toBeTruthy();

		// This creates a random id to avoid name collision
		var layerStringName = 'testLayer_' + this.makeid(7);
		layerName.sendKeys(layerStringName);

		var currentSection = element(by.css('section.step.ng-isolate-scope.current'));
		var continueButton = currentSection.$('.import-wizard-button').element(by.css('button.btn'));

		// Continue to Step 2
		continueButton.click();
	};


	/**
	 * Create Layer - Step 2
	 */
	this.createLayer_Step2 = function() {
		var geometryTypeDropdown = element(by.css('select#geometry_type'));
		expect(geometryTypeDropdown.waitReady()).toBeTruthy();

		/*
			Other useful selectors:
			-----------------------
			Line : com.vividsolutions.jts.geom.LineString
			Polygon : com.vividsolutions.jts.geom.Polygon
			Geometry : com.vividsolutions.jts.geom.Geometry
		*/
		geometryTypeDropdown.$('[value="com.vividsolutions.jts.geom.Point"]').click();

		// Referesh current section var
		var currentSection = element(by.css('section.step.ng-isolate-scope.current'));
		currentSection.$('.btn[value="Continue"]').click();
	};


	/**
	 * Create Layer - Step 3
	 */
	this.createLayer_Step3 = function() {
		var requiredCheck = element(by.css('#fieldNillable-0'));
		expect(requiredCheck.waitReady());
		var currentSection = element(by.css('section.step.ng-isolate-scope.current'));
		currentSection.$('.btn[value="Continue"]').click();
	};


	/**
	 * Create Layer - Step 4
	 */
	this.createLayer_Step4 = function() {
		var startTimeDropdown = element(by.model('layer.configuration_options.start_date'));
		expect(startTimeDropdown.waitReady()).toBeTruthy();
		startTimeDropdown.$('[value="time"]').click();

		var currentSection = element(by.css('section.step.ng-isolate-scope.current'));
		var button = currentSection.$('.btn[value="Next Step"]');
		button.click();
	};


	/**
	 * Create Layer - Step 5
	 */
	this.createLayer_Step5 = function() {
		var shareButton = element.all(by.css('.btn.ng-pristine.ng-untouched.ng-valid')).first();
		expect(shareButton.waitReady()).toBeTruthy();

		var currentSection = element(by.css('section.step.ng-isolate-scope.current'));
		currentSection.$('.btn[type="submit"]').click();
	};


	/**
	 * Create Layer - Step 6
	 */
	this.createLayer_Step6 = function() {
		var currentSection = element(by.css('section[title="Create"]'));
		var continueButton = currentSection.$('.btn[value="Continue"]');
		expect(continueButton.waitReady()).toBeTruthy();
		continueButton.click();

		// Wait x seconds
		browser.driver.sleep(wait_times['layerCreate']);

		var doneButton = element(by.linkText('StoryLayer'));
		expect(doneButton.waitReady()).toBeTruthy();

		doneButton.click();

		browser.driver.sleep(wait_times['newLayer']);
		var saveButton = element(by.partialButtonText('Save'));
		expect(saveButton.waitReady()).toBeTruthy();
		saveButton.click();
	};


	/**
	 * Creates a test story layer by performing all the wizard steps
	 */
	this.createStoryLayer = function() {
		this.createLayer_Step1();
		this.createLayer_Step2();
		this.createLayer_Step3();
		this.createLayer_Step4();
		this.createLayer_Step5();
		this.createLayer_Step6();
	};
};

module.exports = new home_page();
