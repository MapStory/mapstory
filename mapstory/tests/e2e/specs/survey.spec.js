'use strict';
require('../tools/waitReady.js');

let auth = require('../pages/auth.po');
let wait_times = require('../tools/wait_times');
let home_page = require('../pages/home.po');
let layer_metadata = require('../pages/layer_metadata.po');
let path = require('path');
let screenshot_helper = require('../tools/screenshot_helper');
let constants = require("../tools/constants");

/**
 * Tester object
 * @type {Object}
 */
let tester = {
	name: null,
	email: null,
	timestamp: null,
	browser: null,
	resolution: null
};

// Setup the screenshot on error feature
screenshot_helper.setup();

/**
 * Automated Survey tests
 *
 * These tests are mapped to the survey tests here: https://rey52.typeform.com/to/IpjcXD
 */
describe('[Survey Tests] |', function() {
	beforeEach(function(){
		// Fetch Home
		browser.get(constants.baseURL);
		browser.waitForAngular();
	});

	// Take a screenshot automatically after each failing test.
	afterEach(function() {
		// let passed = jasmine.getEnv().currentSpec.results().passed();
		// if (!passed) {
		//
		// }
	});

	describe('<<1>> Tester Info |', function () {
		let randomId = auth.makeid(7);

		describe('<a> Tester name', function() {
			it(': should set a test name', function() {
				tester.name = 'tester_' + randomId;
				expect(tester.name).toBeTruthy('Tester name is expected');
			});
		});

		describe('<b> Your email |', function() {
			it('should set a test email', function() {
				tester.email = 'test_' + randomId + '@testing.com';
				expect(tester.email).toBeTruthy('Tester email is expected');
			});
		});

		describe('<c> Date of testing |', function() {
			it('should set testing timestamp', function() {
				tester.timestamp = Date.now();
				expect(tester.timestamp).toBeTruthy('Testing date is expected');
			});
		});

		describe('<d> Browser |', function() {
			it('> should set browser type', function() {
				// Get the browser name
				browser.getCapabilities().then(function (cap) {
					var version = cap.get('version');
					var browserString = cap.get('browserName') + '_' + version;
					tester.browser = browserString;
					expect(tester.browser).toBeTruthy('Browser name is expected');
				});
			});

			it('> should set browser size', function() {
				tester.resolution = browser.driver.manage().window().getSize();
				expect(tester.resolution).toBeTruthy('Browser size is expected');
			});
		});
	});

	describe('<<2>> User Profile |', function () {
		describe('<a> Create an account |', function() {
			it('> should start by logging out', function() {
				home_page.logout();
				expect(auth.loginIcon.waitReady()).toBeTruthy('Failed to logout!');
			});

			it('> should create a new account', function() {
				expect(auth.loginIcon.isDisplayed()).toBeTruthy('Should log out first!');

				// Click login
				auth.loginIcon.click();
				browser.sleep(1000);

				var loginForm = element(by.css('form.form[action="/account/login/?next=/"]'));
				expect(loginForm.waitReady()).toBeTruthy('Could not find Login Form');

				// Click signup
				var button = element(by.linkText('Sign Up'));
				expect(button.waitReady()).toBeTruthy('Could not find Sign up button');
				button.click();

				var modalWindow = element(by.css('#loginModal'));

				// Create a username
				var usernameInput = modalWindow.element(by.css('#id_username'));
				var nameInput = modalWindow.element(by.css('#id_first_name'));
				var lastNameInput = modalWindow.element(by.css('#id_last_name'));
				var emailInput = element(by.css('#id_email'));
				var passwordInput = element(by.css('#id_password'));
				var confirmPasswordInput = element(by.css('#password_confirm'));
				// Set username
				expect(usernameInput.waitReady()).toBeTruthy();
				usernameInput.sendKeys(tester.name);
				// Set First Name
				nameInput.sendKeys(tester.name);
				// Set Last name
				lastNameInput.sendKeys(auth.getLastName());
				// Set email
				emailInput.sendKeys(tester.email);
				// Set password
				passwordInput.sendKeys(auth.getPassword());
				// Confirm password
				confirmPasswordInput.sendKeys(auth.getPassword());
				// Accept terms
				var termsCheckbox = element(by.model('agreed'));
				termsCheckbox.click();
				// Click Join
				auth.signUpButton.click();
			});



			xit('> should login with new account', function() {
				var loginIcon = element(by.partialLinkText(tester.name));
				expect(loginIcon.waitReady()).toBeTruthy('Did not find login icon');
				loginIcon.click();

				expect(auth.loginForm.isPresent()).toBe(true, 'Did not find login Form');
				expect(auth.loginForm.waitReady()).toBeTruthy('Did not find login Form');
				expect(auth.loginForm.isDisplayed()).toBeTruthy('Did not find login Form');

				// Input username
				expect(auth.usernameInput.isPresent()).toBe(true, 'Did not find username input');
				auth.usernameInput.sendKeys(tester.name);

				// Input password
				expect(auth.passwordInput.isPresent()).toBe(true, 'Did not find password input');
				auth.passwordInput.sendKeys(auth.getPassword());

				// Press the login button
				expect(auth.loginButton.isPresent()).toBe(true, 'Did not find the login button');
				auth.loginButton.click();
			});
		});

		xdescribe('<b> Check your email |', function() {
			it('> should receive confirmation email', function() {

			});
		});

		xdescribe('<c> Confirm email |', function() {
			it('> should confirm email', function() {

			});
		});

		xdescribe('<d> Did receive Welcome email |', function() {
			it('> should receive welcome email', function() {

			});
		});

		describe('<e> Update profile info |', function() {
			it('> should update profile info', function() {
				// Click on your name

				var userIcon = $('.nav-avatar');
				expect(userIcon.waitReady()).toBeTruthy('Did not find the user icon');

				userIcon.click();

				var editProfileLink = element(by.partialLinkText('Edit Profile'));
				expect(editProfileLink.waitReady()).toBeTruthy();
				editProfileLink.click();

				var lastnameDiv = element(by.css('#div_id_last_name'));

				var lastNameInput = lastnameDiv.element(by.css('#id_last_name'));
				expect(lastNameInput.waitReady()).toBeTruthy();

				lastNameInput.sendKeys('t_123');

				var updateProfileButton = element(by.css('[value="Update profile"]'));
				updateProfileButton.click();

				var userinfos = element(by.css('.user-info'));
				var usertitle = userinfos.all(by.css('h1'));
				usertitle.first().getText().then(function(text){
					expect(text.includes('t_123')).toBeTruthy();
				});
			});
		});

	});

	/**
		3. Uploading Datasets
		======================
	**/
	describe('<<3>> Uploading Datasets |', function () {

		var testUpload = {
			filetype: 'CSV',

		};

		/**
			a. Data format:
			  - CSV
			  - SHP
			  - KML
			  - JSON

		**/
		describe('<a> Set data format |', function() {
			it('> should use CSV', function() {
				expect(testUpload.filetype).toEqual('CSV');
			});

			xit('> should use SHP', function() {

			});

			xit('> should use KML', function() {

			});

			xit('> should use JSON', function() {

			});
		});

		/**

			b. Geometry:
			  - Points
			  - Lines
			  - Polygons
		**/
		xdescribe('<b> Set Geometry type |', function() {


		});
		/**
			c. Timescale:
			  - 4.5 Billion Years
			  - 650 Million years
			  - Present time
		**/
		xdescribe('<c> Set Timescale', function() {

		});
		/**
			d. Uploading:
			  Were you able to upload succesfully?
		**/
		xdescribe('<d> Uploading', function() {
			beforeEach(function() {
				element(by.linkText('Create')).click();
				home_page.importLayerLink.click();
			});

			it('> has a "Close button"', function() {
				let closeButton = element(by.css('i.fa.fa-times.pointer.import-wizard-icon'));
				expect(closeButton.isDisplayed()).toBe(true);
				closeButton.click();
			});

			describe('> Step 1', function() {
				it('> should complete step 1', function() {
					home_page.uploadLayer_Step1();
				});

				xit('> can close the form', function() {

				});

				xit('> highlights the correct step', function() {

				});
			});

			describe('> Step 2', function() {
				it('should complete step 2', function() {
					home_page.uploadLayer_Step1();
					home_page.uploadLayer_Step2();
				});
			});

			describe('> Step 3', function() {
				it('> should complete step 3', function() {
					home_page.uploadLayer_Step1();
					home_page.uploadLayer_Step2();
					home_page.uploadLayer_Step3();
				});
			});

			describe('> Step 4', function() {
				it('should complete step 4', function() {
					home_page.uploadLayer_Step1();
					home_page.uploadLayer_Step2();
					home_page.uploadLayer_Step3();
					home_page.uploadLayer_Step4();
				});
			});

			describe('> Step 5', function() {
				it('> should complete step 5', function() {
					home_page.uploadLayer_Step1();
					home_page.uploadLayer_Step2();
					home_page.uploadLayer_Step3();
					home_page.uploadLayer_Step4();
					home_page.uploadLayer_Step5();
				});

			});

			describe('> Step 6', function() {
				it('> should complete step 6', function() {
					home_page.uploadLayer_Step1();
					home_page.uploadLayer_Step2();
					home_page.uploadLayer_Step3();
					home_page.uploadLayer_Step4();
					home_page.uploadLayer_Step5();
					home_page.uploadLayer_Step6();
				});
			});
		});

		/**
			e. Click 'Update Metadata' and add responses to questions. Does it display correctly?
		**/
		xdescribe('<e> Update Metadata', function() {
			beforeEach(function() {
				element(by.linkText('Create')).click();
				home_page.importLayerLink.click();
				home_page.uploadLayer_Step1();
				home_page.uploadLayer_Step2();
				home_page.uploadLayer_Step3();
				home_page.uploadLayer_Step4();
				home_page.uploadLayer_Step5();
			});

			it('> Can edit metadata', function() {
				home_page.uploadLayer_Step6();
				browser.sleep(wait_times['metadata_load']);
				expect(layer_metadata.titleInput.waitReady()).toBeTruthy();
				expect(layer_metadata.categoryDropdown.waitReady()).toBeTruthy();
				expect(layer_metadata.summaryText.waitReady()).toBeTruthy();
				expect(layer_metadata.languageDropdown.waitReady()).toBeTruthy();
				expect(layer_metadata.dataSourceText.waitReady()).toBeTruthy();
				expect(layer_metadata.dataQualityText.waitReady()).toBeTruthy();
				expect(layer_metadata.purposeText.waitReady()).toBeTruthy();
				expect(layer_metadata.isPublishedCheckbox.waitReady()).toBeTruthy();


				// Save
				layer_metadata.saveButton.click();
			});
		});


		/**
			f. Click update layer settings again and make sure that "Is published" is checked and save. Go to explore and find your update layer. Did you find it?
		**/
		xdescribe('<f> Set is published', function() {
			beforeEach(function() {
				element(by.linkText('Create')).click();
				home_page.importLayerLink.click();
				home_page.uploadLayer_Step1();
				home_page.uploadLayer_Step2();
				home_page.uploadLayer_Step3();
				home_page.uploadLayer_Step4();
				home_page.uploadLayer_Step5();
			});

			it('should set published checkbox', function(){
				home_page.uploadLayer_Step6();
				browser.sleep(wait_times['metadata_load']);

				expect(layer_metadata.isPublishedCheckbox.waitReady()).toBeTruthy();
				layer_metadata.isPublishedCheckbox.click();

				// Save
				layer_metadata.saveButton.click();
			});

		});


		/**
			g. Click Download. Try to download the filetypes . No errors?
		**/
		xdescribe('<g> Download filetypes', function() {
			beforeEach(function() {
				element(by.linkText('Create')).click();
				home_page.importLayerLink.click();
				home_page.uploadLayer_Step1();
				home_page.uploadLayer_Step2();
				home_page.uploadLayer_Step3();
				home_page.uploadLayer_Step4();
				home_page.uploadLayer_Step5();
				home_page.uploadLayer_Step6();

				browser.sleep(wait_times['metadata_load']);

				// Mark as published
				expect(layer_metadata.isPublishedCheckbox.waitReady()).toBeTruthy();
				layer_metadata.isPublishedCheckbox.click();

				// Save
				layer_metadata.saveButton.click();

				browser.sleep(1000);
			});

			it('should download CSV', function(){
				browser.sleep(2000);
				let downloadLink = element(by.linkText('Download'));
				expect(downloadLink.waitReady()).toBeTruthy();

				downloadLink.click();
				browser.sleep(1000);

				let CSVlink = element(by.linkText('CSV'));
				expect(CSVlink.waitReady()).toBeTruthy();

				CSVlink.click();
			});
		});
		/**
			h. Add tags to storylayer. Go to explore page and search for your storylayer using these tags.
		**/
		describe('<h> Add Tags to storylayer', function() {

		});
		/**
			i. Go to comments tab and leave a comment. Success?
		**/
		describe('<i> Comments section', function() {

		});
		/**
			j. Click "Mark as favorite" . The link should toggle. Check the favorites tab in your profile. Does it display under favorites?
		 */
		describe('<j> Mark as favorite', function() {

		});
	});

	describe('<< 4 >> Editing StoryLayer Features -', function () {

		/**
			4. Editing StoryLayer Features
			===============================

			a. Go to the storylayer detail page. Click "edit this story layer" button. Does the layer appear on the map display? Complete with time and info?
		**/
		describe('<a> Edit Story layer', function() {

		});
		/**
			b. Click "Add Feature" and create new feature geometry and add attrib values. Were you able to add new features without encountering errors?
		**/
		describe('<b> Add Feature geometry', function() {

		});
		/**
			c. Click "Edit Feature" and update the geometry a random feature. Did it update?
		**/
		describe('<c> Edit and update geometry', function() {

		});
		/**
			d. Click "Edit feature" and update the attribute values of a reandom feature. Did it update?
		**/
		describe('<d> Update attribute values', function() {

		});
		/**
			e. Click on a feature and try to remove a feature. Where you able to delete an existing feature from storylayer?
		**/
		describe('<e> Remove a feature', function() {

		});
		/**
			f. Do the edits from step 5.2 to step 5.3 appear in the history log (4 edits total)? Does the name/username appear on it?
		**/
		describe('<f> History logs', function() {

		});
		/**
			g. Undo the deletion you made in Step 5.5 Check if theres a new green history log in view history. Were you able to revert back?
		*/
		describe('<g> Undo deletion', function() {

		});

	});

	describe('<< 5 >> Managing Chapters -', function () {
		/**
			5. Managing Chapters
			====================

			a. Launch the Composer. Start composing by choosing "Compose Mapstory". After provinding basic info about mapstory, did "Save Sucesful" appear?
		**/
		describe('<a>', function(){

		});
		/**
			b. Update the chapter information of chapter 1. Were you able to save without errors?
		**/
		describe('<b>', function(){

		});
		/**
			c. Create a new chapter and update its chapter info. Were you able to do this step without encountering any error messages?
		**/
		describe('<c>', function(){

		});
		/**
			d. Go back to the chapter info of the first chapter. Are the contests in step 7.2 still displayed?
		**/
		describe('<d>', function(){

		});
		/**
			e. Let's delete Chapter 2. Did it delete withour error?
		 */
		describe('<e>', function(){

		});

	});

	describe('<< 6 >> Adding StoryLayers -', function () {
		/**
			6. Adding StoryLayers
			=====================

			a. Load the "add a storylayer" wizard, perform a quick search of any random storylayer. Click view storylayer. Did it load in a new tab that displays ok?
		**/
		describe('<a>', function() {

		});
		/**
			b. 8.2 Load the "add a storylayer" window. Perform a quick search and then click "Use". Did the story load on composer OK? Example keyworkds: "USA, Africa, street, river"
		**/
		describe('<b>', function() {

		});
		/**
			c. Add the layer you uploaded earlier as a storylayer to your mapstory. Did it find it in the epxlore storylayers pop-up window under the My storylayers tab?
		**/
		describe('<c>', function() {

		});
		/**
			d. Click Use storylayer. Did it load on composer?
		**/
		describe('<d>', function() {

		});
		/**
			e. Does the timeline below the map display OK?
		**/
		describe('<e>', function() {

		});
		/**
			f. Click play. Do all of the features on the map appear as that you expect?
		**/
		describe('<f>', function() {

		});
		/**
			g. Click on the layer's title on the sidebar. Click 'Masking' button. Change the "Layer Alias" ckick and hit save settings. Does the lengend display the updated title?
		**/
		describe('<g>', function() {

		});
		/**
			h. Rename the attributes of you storylayer on the "Masking" panel. Click on a feature on the map. Does the infobox display the updated attribute names you just set?
		**/
		describe('<h>', function() {

		});
		/**
			i. Exit Masking and test the layer reordering by dragging the layers up and down the list. Does the reordering reflect on the map display?
		**/
		describe('<i>', function() {

		});
		/**
			j. Remove a storylayer from a chapter. Were you able to remove the storylayer you added in step 2 withour errors?
		 */
		describe('<j>', function() {

		});

	});

	describe('<< 7 >> Appending data -', function () {
		/**
			7. Appending data
			=================

			a. How many data records (rows) would you like to append? NUM
			b Download the CSV schema. Update the file using the data you have. Now upload it. Were you able to append your data?
			c. Download the SHP shchema. Update the file, upload .

			>> "Are your features added to the StoryLayer?" And
			>> "Are your edits appearing in the Edit History?"

			1) From the MapStory drop down, click "Create StoryLayer".
			2) Give your StoryLayer a name and define the geometry type you want to use
			3) Add an attribute (i.e. add a text attribute for "Name")
			4) Indicate which of your attributes is for time
			5) Set your StoryLayer to be open for editing
			7) Create your StoryLayer

			Questions :
			1) are you taken to a StoryLayer page with your StoryLayer title and an empty map?
			Now, click "Edit StoryLayer".
			Try adding a feature to this StoryLayer and save.
			Does your new feature show up on the StoryLayer playback?
			Does it show up in the Edit History?
		 */

		describe('How many data records?', function() {

		});
	});
});
