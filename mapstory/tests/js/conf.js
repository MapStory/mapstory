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
	specs: ['*.spec.js'],

	//capabilities: {
	//	browserName: 'chrome'
		// browserName: 'firefox'
	//},
	multiCapabilities: [
		{'browserName' : 'chrome'},
		// {'browserName' : 'firefox'}
		// {'browserName' : 'safari'},
	],

	jasmineNodeOpts: {
		showColors: true, // Use colors in the command line report.
		defaultTimeoutInterval: 30000
	},
	allScriptsTimeout: 30000
};
