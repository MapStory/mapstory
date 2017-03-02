'use strict';

/**
 * Protractor tests configuration
 * ==============================
 *
 * This file is used to configure the browser used for teting.
 * Tests can also be cherry picked by commenting them out to dissable.
 * For multiple-browser testing uncomment browsers inside `multiCapabilities`
 *
 */
let PixDiff = require('pix-diff');
// Default configuration:
let selenium_url = 'http://localhost:4444/wd/hub';
let multi_cabapilities = [{
	'browserName' : 'chrome',
	'chromeOptions': {
		// Get rid of --ignore-certificate yellow warning
		args: ['--no-sandbox', '--test-type=browser'],
		// Set download path and avoid prompting for download even though
		// this is already the default on Chrome but for completeness
		prefs: {
			'download': {
				'prompt_for_download': false,
				'default_directory': '../downloads/'
			}
		}
	}}
];

let settings = {
	framework: 'jasmine',
	seleniumAddress: selenium_url,
	//--------------------------
	// Use this to run all test files
	specs: ['specs/*.spec.js'],
	// specs: [
		// 'specs/image.spec.js',
		// 'tools/take_screenshots.js'
	// ],
	//---------------------------------------
	// Use this to run the tests in several browsers simultaniously
	multiCapabilities: multi_cabapilities,
	jasmineNodeOpts: {
		showColors: true, // Use colors in the command line report.
		defaultTimeoutInterval: 30000
	},
	allScriptsTimeout: 30000,
	// Results output file
	resultJsonOutputFile:'./result.json',
	onPrepare: function() {
		browser.pixDiff = new PixDiff({
			basePath: 'e2e/images/',
			diffPath: 'e2e/images/',
			width: 1440,
			height: 800
		});
	},
};


// This overrides the configuration if we are running inside Travis
if(process.env.TRAVIS) {
	// Use sauce labs for cloud browser testing
	selenium_url = 'http://' + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY +'@ondemand.saucelabs.com/wd/hub';

	// Set the browsers we want to test on
	multi_cabapilities = [{
		'browserName' : 'firefox',
		'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
		'name': 'Mapstory Firefox Tests',
		'build': process.env.TRAVIS_BUILD_NUMBER,
		'tags': [process.env.TRAVIS_PYTHON_VERSION, 'CI']
	},{
		'browserName' : 'chrome',
		'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
		'build': process.env.TRAVIS_BUILD_NUMBER,
		'tags': [process.env.TRAVIS_PYTHON_VERSION, 'CI'],
		'name': 'Mapstory Chrome Tests',
		'chromeOptions': {
			// Get rid of --ignore-certificate yellow warning
			args: ['--no-sandbox', '--test-type=browser'],
			// Set download path and avoid prompting for download even though
			// this is already the default on Chrome but for completeness
			prefs: {
				'download': {
					'prompt_for_download': false,
					'default_directory': '../downloads/'
				}
			}
		}
	}];

	settings = {
		framework: 'jasmine',
		seleniumAddress: selenium_url,
		//--------------------------
		// Use this to run all test files
		specs: ['specs/*.spec.js'],
		//---------------------------------------
		// Use this to run the tests in several browsers simultaniously
		multiCapabilities: multi_cabapilities,
		jasmineNodeOpts: {
			showColors: true, // Use colors in the command line report.
			defaultTimeoutInterval: 30000
		},
		allScriptsTimeout: 30000,
		// Results output file
		resultJsonOutputFile:'./result.json',
		// SauceLabs Config
		sauceUser: process.env.SAUCE_USERNAME,
		sauceKey: process.env.SAUCE_ACCESS_KEY,
		onPrepare: function() {
			browser.pixDiff = new PixDiff({
				basePath: 'e2e/images/',
				diffPath: 'e2e/images/',
				width: 1440,
				height: 800
			});
		},
	};
}

exports.config = settings;
