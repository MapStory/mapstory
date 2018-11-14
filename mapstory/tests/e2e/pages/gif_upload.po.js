/**
 * GIF Uploader
 */

/**
 * Composer Page Object
 * ====================
 */



import "../tools/waitReady";
import makeID from "../tools/make_id";
import timings from "../tools/wait_times";
import { baseURL } from "../tools/constants";

/**
 * Composer Page Object
 */
const GifUploader = () => {
  /**
   * Gets uploader dialog
   */
  this.get = () => {
    const composerURL = `${baseURL  }/story/new?tour`;

    // Angular sync fails on Composer. So we need to turn it off
    browser.ignoreSynchronization = true;
    browser.get(composerURL);
    browser.sleep(timings.composerTourModal);
  };

  /**
   * Generates a random story title
   * @param  {uint} stringLength Length of random ID (Defaults to 5)
   * @return {String}        A random story title
   */
  this.makeRandomTitle = (stringLength) => `testStory${  makeID(stringLength)}`;

};

export default new GifUploader();
