'use strict';

exports.config = {
	framework: 'jasmine',
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: ['*.spec.js'],
	capabilities: {
		browserName: 'chrome'
		// browserName: 'firefox'
	},
	jasmineNodeOpts: {
		showColors: true, // Use colors in the command line report.
		defaultTimeoutInterval: 30000
	},
	allScriptsTimeout: 30000
};
