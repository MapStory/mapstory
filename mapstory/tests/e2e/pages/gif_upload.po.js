/**
 * GIF Uploader
 */

/**
 * Composer Page Object
 * ====================
 */
require("../tools/waitReady.js");
const makeID = require("../tools/make_id.js");
const waitTimes = require("../tools/wait_times.js");
const constants = require("../tools/constants");

/**
 * Composer Page Object
 */
function GIFUploader() {
  /**
   * Gets uploader dialog
   */
  this.get = () => {
    const composerURL = `${constants.baseURL}/story/new?tour`;

    // Angular sync fails on Composer. So we need to turn it off
    browser.ignoreSynchronization = true;
    browser.get(composerURL);
    browser.sleep(waitTimes.composer_tour_modal);
  };

  /**
   * Generates a random story title
   * @param  {uint} length Length of random ID (Defaults to 5)
   * @return {String}        A random story title
   */
  this.makeRandomTitle = (length) => `test_story_${makeID(length)}`;
};

module.exports = new GIFUploader();
