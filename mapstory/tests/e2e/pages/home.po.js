/**
 * Home Page Object
 * ================
 *
 * Describes the homepage object and its elements
 */
'use strict';

require('../tools/waitReady.js');
let path = require('path');
// Upload paths need to be absolute or error.
const testLayerFileRelative = '../../sampledata/lewisandclarktrail.csv';
const testLayerFile = path.resolve(__dirname, testLayerFileRelative);
let remote = require('selenium-webdriver/remote');
browser.setFileDetector(new remote.FileDetector());
let wait_times = require('../tools/wait_times');
let auth = require('./auth.po');
let constants = require("../tools/constants");


/**
 * Home Page Object
 */
let home_page = function() {
	this.loginIcon = element(by.linkText('Log In'));
	this.loginModal = element(by.css('.modal-content'));
	this.navigationTabs = element(by.css('.nav.nav-tabs'));
	this.adminLink = element(by.css('.nav-avatar'));
	this.logoutLink =  element(by.linkText('Log out'));
	this.login_close_button = element(by.css('.close.pull-right'));
	this.loginForm = element(by.css('form.form[action="/account/login/?next=/"]'));
	this.userAvatar = element(by.css('.nav-avatar'));
	this.usernameInput = this.loginForm.element(by.css('input.form-control[name="username"]'));
	this.passwordInput = this.loginForm.element(by.css('input.form-control[name="password"]'));
	this.loginButton = this.loginForm.element(by.partialButtonText('Sign in'));
	this.navBar = element(by.css('.navigation-menu'));
	this.menuCreate = element(by.linkText('Create'));
	this.menu_explore = element(by.linkText('Explore'));
	this.step1 = element(by.css('[title="Check Your Data"]'));
	this.step2 = element(by.css('.row.step.ng-isolate-scope.current'));
	this.step3 = element(by.css('.row.step.ng-isolate-scope.current[title="Title"]'));
	this.step4 = element(by.xpath('/html/body/div[6]/div/div/div[2]/div/div/div/section[8]'));
	this.step5 = element(by.css('section[title="Editing"]'));
	this.step6 = element(by.css('section[title="Import"]'));
	this.importLayerLink = this.navBar.element(by.linkText('Import StoryLayer'));
	this.createLayerLink = this.navBar.element(by.linkText('Create StoryLayer'));
	this.uploadIconsLink = this.navBar.element(by.linkText('Upload Icons'));
	this.composeStoryLink = this.navBar.element(by.linkText('Compose Story'));

	this.get = function(){
		browser.get(constants.baseURL);
		browser.waitForAngular();
	};

	/**
	 * Signs in a user
	 *
	 * @param  {string}     user        The username
	 * @param  {string}     password    The password
	 *
	 * @return {boolean}    True if successful
	 */
	this.login = function(user, password){

		if(this.loginForm.isDisplayed() === true) {

			// Sets username
			let usernameInput = this.loginForm.element(by.css('input.form-control[name="username"]'));
			usernameInput.sendKeys(user);

			// Sets password
			let passwordInput = this.loginForm.element(by.css('input.form-control[name="password"]'));
			passwordInput.sendKeys(password);

			// Push login button
			let loginButton = this.loginForm.element(by.partialButtonText('Sign in'));
			loginButton.click();

			return true;

		} else {

			// Failed to Login
			return false;
		}
	};


	/**
	 * Logs out the user
	 */
	this.logout = function() {
		let myself = this;
		// Only log out if necesary
		this.isLoggedIn().then(function(loggedIn){
			// Click the login button
			if(loggedIn) {
				// Click the admin button
				myself.adminLink.click();

				// Click the logout link
				expect(myself.logoutLink.waitReady()).toBeTruthy();
				myself.logoutLink.click();

				// Refresh page
				// TODO: Get the webpage dynamically
				browser.get(constants.baseURL);
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
		return this.userAvatar.isPresent();
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
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		// Sets the default
		if (length < 1 ){ length = 7; }

		// Builds the string
		for( let i=0; i < length; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	};


	/**
	 * Completes Upload Layer - Step 1
	 */
	this.uploadLayer_Step1 = function() {
		expect(this.step1.waitReady()).toBeTruthy();

		let title = this.step1.element(by.css('.step-title'));
		title.getText().then(function(text) {
			expect(text).toEqual('Before we begin');
		});

		let button = this.step1.element(by.buttonText('Let\'s Begin!'));
		expect(button.isDisplayed()).toBeTruthy();
		button.click();
	};


	/**
	 * Completes Upload Layer - Step 2
	 */
	this.uploadLayer_Step2 = function() {
		let selectFileButton = element(by.css('[for="my-file-selector"]'));
		expect(selectFileButton.waitReady()).toBeTruthy();

		// Firefox needs the element to be visible for interaction with the element to work
		browser.executeAsyncScript(function(callback) {
			document.querySelectorAll('#my-file-selector')[0].style.display = 'inline';
			callback();
		});

		// Now you can upload.
		element(by.css('#my-file-selector')).sendKeys(testLayerFile);

		let status = element(by.css('[ng-show="layer.state"]'));
		expect(status.waitReady()).toBeTruthy();

		status.getText().then(function(text){
			expect(text).toEqual('Status: UPLOADED');
		});

		let nextButton = this.step2.element(by.css('[value="Next Step"]'));
		expect(nextButton.waitReady()).toBeTruthy();
		nextButton.click();
	};


	/**
	 * Completes Upload Layer - Step 3
	 */
	this.uploadLayer_Step3 = function() {
		let nextButton3 = this.step3.element(by.css('[value="Next Step"]'));
		expect(nextButton3.waitReady()).toBeTruthy();
		nextButton3.click();
	};


	/**
	 * Completes Upload Layer - Step 4
	 */
	this.uploadLayer_Step4 = function() {
		let steps = element(by.css('[class="steps"]'))
		let step = steps.element(by.xpath('section[8]'));
		let startTimeDropdown = step.element(by.id('start_date'));
		expect(startTimeDropdown.waitReady()).toBeTruthy();
		// startTimeDropdown.click();
		startTimeDropdown.$('[value="e_date"]').click();
		// startTimeDropdown.$('[value="e_date"]').click();
		startTimeDropdown.sendKeys(protractor.Key.ENTER);

		let nextButton4 = this.step4.element(by.css('button[value="Next Step"]'));
		expect(nextButton4.waitReady()).toBeTruthy();
		nextButton4.click();
	};


	/**
	 * Completes Upload Layer - Step 5
	 */
	this.uploadLayer_Step5 = function() {
		// Step 5
		let nextButton5 = this.step5.element(by.css('button[value="Next Step"]'));
		expect(nextButton5.waitReady()).toBeTruthy();
		nextButton5.click();
	};


	/**
	 * Completes Upload Layer - Step 6
	 */
	this.uploadLayer_Step6 = function() {
		let importButton = this.step6.element(by.buttonText('Import Layer'));
		expect(importButton.waitReady()).toBeTruthy();
		importButton.click();

		browser.driver.sleep(wait_times['layerUpload']);

		let finishButton = this.step6.element(by.buttonText('View Layer'));
		expect(finishButton.waitReady()).toBeTruthy();

		let stepTitle = this.step6.$$('.step-title').first();
		stepTitle.getText(function(text){
			expect(text).toEqual('Congratulations! Click below to view your new Layer.');
		});

		finishButton.click();
	};


	/**
	 * Create Layer - Step 1
	 */
	this.createLayer_Step1 = function() {
		let layerName = element(by.css('#layerName'));
		expect(layerName.waitReady()).toBeTruthy();

		// This creates a random id to avoid name collision
		let randomId = this.makeid(12);
		let layerStringName = 'testLayer_' + randomId;
		layerName.sendKeys(layerStringName).then(() => {
			let currentSection = element(by.css('section.step.ng-isolate-scope.current'));
			let continueButton = currentSection.$('.import-wizard-button').element(by.css('button.btn'));
			// Continue to Step 2
			continueButton.click();
		});
	};


	/**
	 * Create Layer - Step 2
	 */
	this.createLayer_Step2 = function() {
		let geometryTypeDropdown = element(by.css('#geometry_type'));
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
		let currentSection = element(by.css('section.step.ng-isolate-scope.current'));
		currentSection.$('.btn[value="Continue"]').click();
	};


	/**
	 * Create Layer - Step 3
	 */
	this.createLayer_Step3 = function() {
		let requiredCheck = element(by.css('#fieldNillable-0'));
		expect(requiredCheck.waitReady());
		let currentSection = element(by.css('section.step.ng-isolate-scope.current'));
		currentSection.$('.btn[value="Continue"]').click();
	};


	/**
	 * Create Layer - Step 4
	 */
	this.createLayer_Step4 = function() {
		let startTimeDropdown = element(by.model('layer.configuration_options.start_date'));
		expect(startTimeDropdown.waitReady()).toBeTruthy();
		startTimeDropdown.$('[value="time"]').click();

		let currentSection = element(by.css('section.step.ng-isolate-scope.current'));
		let button = currentSection.$('.btn[value="Next Step"]');
		button.click();
	};


	/**
	 * Create Layer - Step 5
	 */
	this.createLayer_Step5 = function() {
		let shareButton = element.all(by.css('.btn.ng-pristine.ng-untouched.ng-valid')).first();
		expect(shareButton.waitReady()).toBeTruthy();

		let currentSection = element(by.css('section.step.ng-isolate-scope.current'));
		currentSection.$('.btn[type="submit"]').click();
	};


	/**
	 * Create Layer - Step 6
	 */
	this.createLayer_Step6 = function() {
		let currentSection = element(by.css('section[title="Create"]'));
		let continueButton = currentSection.$('.btn[type="submit"]');
		expect(continueButton.waitReady()).toBeTruthy();
		continueButton.click();

		// Wait x seconds
		browser.driver.sleep(wait_times.layerCreate);

		let doneButton = element(by.partialLinkText('StoryLayer'));
		expect(doneButton.waitReady()).toBeTruthy();

		// doneButton.click();

		// browser.driver.sleep(wait_times['newLayer']);
		// let saveButton = element(by.partialButtonText('Save'));
		// expect(saveButton.waitReady()).toBeTruthy();
		// saveButton.click();
	};


	/**
	 * Creates a test story layer by performing all the wizard steps
	 */
	this.createStoryLayer = function() {
		// Follow all the steps in order
		// TODO: Parametrize these functions
		this.createLayer_Step1();
		this.createLayer_Step2();
		this.createLayer_Step3();
		this.createLayer_Step4();
		// Temporarily disabled
		//this.createLayer_Step5();
		this.createLayer_Step6();
	};
};

module.exports = new home_page();
