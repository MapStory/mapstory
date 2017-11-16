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

//----------------------
// Variable settings
let selenium_url = 'http://#';

if(process.env.DOCKER){
	selenium_url = 'http://selenium:4444/wd/hub';
} else {
	selenium_url = 'http://localhost:4444/wd/hub';
}

const browser_width = 1440;
const browser_height = 800;

//Override and use saucelabs webdriver
// selenium_url = 'http://ondemand.saucelabs.com:80';

let timeout = 30000;
let multi_cabapilities = [{
	'browserName' : 'chrome',
	'chromeOptions': {
		args: [
			'--no-sandbox',
			'--test-type=browser',
			'--window-size=' + browser_width + ',' + browser_height
		],
		prefs: {
			'download': {
				'prompt_for_download': false,
				'default_directory': '../downloads/'
			}
		}
	}
}];


//----------------------
// Default settings
let settings = {
	framework: 'jasmine',
	seleniumAddress: selenium_url,
	//--------------------------
	// Use this to run all test files
	specs: ['specs/*.spec.js'],
	/*
	specs: [
		// 'tools/take_screenshots.js',
		'specs/auth.spec.js',
		'specs/composer.spec.js',
		'specs/explore.spec.js',
		'specs/home.spec.js',
		// 'specs/icon_upload.spec.js',
		// 'specs/image.spec.js',
		// 'specs/journal.spec.js',
		// 'specs/search.spec.js',
		// 'specs/survey.spec.js',
		// 'specs/icons.spec.js'
	],
	*/
	multiCapabilities: multi_cabapilities,
	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: timeout * 2
	},
	getPageTimeout: timeout,
	allScriptsTimeout: timeout,
	// Results output file
	resultJsonOutputFile:'./result.json',
	onPrepare: function() {
		// Setup pix-diff directories and resolution
		browser.pixDiff = new PixDiff({
			basePath: 'e2e/images/',
			diffPath: 'e2e/images/',
			width: browser_width,
			height: browser_height
		});
	}
};

//----------------------
// Testing settings
// This overrides the configuration if we are using sauce-connect
if(process.env.DOCKER) {
	selenium_url = 'http://selenium:4444/wd/hub';
	multi_cabapilities = [{
		'browserName' : 'chrome',
		'tags': ['dev'],
		'name': 'Mapstory Chrome Tests',
		'chromeOptions': {
			args: [
				'--no-sandbox',
				'--test-type=browser',
				'--window-size=' + browser_width + ',' + browser_height
			],
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
		specs: ['specs/*.spec.js'],
		multiCapabilities: multi_cabapilities,
		jasmineNodeOpts: {
			showColors: true,
			defaultTimeoutInterval: timeout * 2
		},
		getPageTimeout: timeout,
		allScriptsTimeout: timeout,
		resultJsonOutputFile:'./result.json',
		onPrepare: function() {
			browser.pixDiff = new PixDiff({
				basePath: 'e2e/images/',
				diffPath: 'e2e/images/',
				width: browser_width,
				height: browser_height
			});
		}
	};
}

//----------------------
// Testing settings
// This overrides the configuration if we are running inside Travis
if(process.env.TRAVIS) {
	// Use sauce labs for cloud browser testing
	// TODO(Zunware): Use https!!!
	selenium_url = 'http://' + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY +'@ondemand.saucelabs.com/wd/hub';
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
			args: [
				'--no-sandbox',
				'--test-type=browser',
				'--window-size=' + browser_width + ',' + browser_height
			],
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
		specs: ['specs/*.spec.js'],
		multiCapabilities: multi_cabapilities,
		jasmineNodeOpts: {
			showColors: true,
			defaultTimeoutInterval: timeout * 4
		},
		getPageTimeout: timeout,
		allScriptsTimeout: timeout,
		resultJsonOutputFile:'./result.json',
		sauceUser: process.env.SAUCE_USERNAME,
		sauceKey: process.env.SAUCE_ACCESS_KEY,
		onPrepare: function() {
			browser.pixDiff = new PixDiff({
				basePath: 'e2e/images/',
				diffPath: 'e2e/images/',
				width: browser_width,
				height: browser_height
			});
		}
	};
}

exports.config = settings;
