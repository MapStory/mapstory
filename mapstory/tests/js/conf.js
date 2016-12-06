'use strict';

/**
 * End to end test Config
 * ======================
 *
 * Notes
 * ----
 * - Will automatically include all tests inside files named `*.spec.js`
 * - Sometimes tests break in chrome when you have another instance of the browser open and logged into mapstory.
 *
 */

exports.config = {
	framework: 'jasmine',
	seleniumAddress: 'http://localhost:4444/wd/hub',

	//--------------------------
	// Runs ALL specs
	// specs: ['*.spec.js'],

	// Cherry pick specks here:
	specs: [
		'auth.spec.js',
		'composer.spec.js',
		'home.spec.js',
		'icon_upload.spec.js',
		'search.spec.js',
		'survey.spec.js',
	],

	//capabilities: {
	//	browserName: 'chrome'
		// browserName: 'firefox'
	//},
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
		// {'browserName' : 'firefox'}
		// {'browserName' : 'safari'},
	],

	jasmineNodeOpts: {
		showColors: true, // Use colors in the command line report.
		defaultTimeoutInterval: 30000
	},
	allScriptsTimeout: 30000
};
