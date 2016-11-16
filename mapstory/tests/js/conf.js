exports.config = {
	framework: 'jasmine',
	seleniumAddress: 'http://localhost:4444/wd/hub',
	// specs: ['home.spec.js'],
	specs: ['*.spec.js'],
	capabilities: {
		browserName: 'firefox'
	},
	jasmineNodeOpts: {
		showColors: true, // Use colors in the command line report.
	}
};
