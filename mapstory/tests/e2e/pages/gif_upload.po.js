/**
 * GIF Uploader
 */

/**
 * Composer Page Object
 * ====================
 */
'use strict';

require('../tools/waitReady.js');
let make_id = require('../tools/make_id.js');
let wait_times = require('../tools/wait_times.js');
let constants = require('../tools/constants');

/**
 * Composer Page Object
 */
let GIF_uploader = function() {
	/**
	 * Gets uploader dialog
	 */
	this.get = function() {
	    let composerURL = constants.baseURL + '/story/new?tour';

	    // Angular sync fails on Composer. So we need to turn it off
		browser.ignoreSynchronization = true;
		browser.get(composerURL);
		browser.sleep(wait_times.composer_tour_modal);
	};

	/**
	 * Generates a random story title
	 * @param  {uint} length Length of random ID (Defaults to 5)
	 * @return {String}        A random story title
	 */
	this.makeRandomTitle = function(length) {
		return 'test_story_' + make_id(length);
	};

};

module.exports = new GIF_uploader();
