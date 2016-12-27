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

exports.config = {
	framework: 'jasmine',
	seleniumAddress: 'http://localhost:4444/wd/hub',

	//--------------------------
	// Use this to run all test files
	// specs: ['*.spec.js'],

	//--------------------------
	// Use this to cherry-pick tests
	specs: [
		'auth.spec.js',
		'composer.spec.js',
		// 'home.spec.js',
		// 'icon_upload.spec.js',
		// 'search.spec.js',
		// 'survey.spec.js',
	],

	//---------------------------------------
	// Use this to run the tests in several browsers simultaniously
	multiCapabilities: [
		{
			'browserName' : 'chrome',
			'chromeOptions': {
				// Get rid of --ignore-certificate yellow warning
				args: ['--no-sandbox', '--test-type=browser'],
				// Set download path and avoid prompting for download even though
				// this is already the default on Chrome but for completeness
				prefs: {
					'download': {
						'prompt_for_download': false,
						'default_directory': '../downloads/',
					},
				},
			},
		},
		//-----------------------------
		// Uncomment to use:
		// {'browserName' : 'firefox'}
		// {'browserName' : 'safari'},
	],

	jasmineNodeOpts: {
		showColors: true, // Use colors in the command line report.
		defaultTimeoutInterval: 30000
	},
	allScriptsTimeout: 30000,
	//----------------------------------------------
	// Results output file
	resultJsonOutputFile:'./result.json',
};
