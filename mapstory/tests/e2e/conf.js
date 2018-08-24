/**
 * ===========================
 * === Mapstory E2E Tests ===
 * ===========================
 *
 * Uses protractor for testing from the browser.
 *
 * How to run E2E tests
 * --------------------
 * 1. Install dependencies with `install_testing_deps.sh` script. Then run `webdriver-manager update`
 * 2. On one shell : Start the webriver: webdriver-manager start
 * 3. On another shell: Run the tests with `./runE2ETests.sh`
 *
 * Notes
 * ------
 * You can use this tool for finding the right selectors: https://github.com/andresdominguez/elementor
 * After install run: `elementor http://192.168.56.151` to start the tool
 */

/**
 * Protractor tests configuration
 * ==============================
 *
 * This file is used to configure the browser used for teting.
 * Tests can also be cherry picked by commenting them out to dissable.
 * For multiple-browser testing uncomment browsers inside `multiCapabilities`
 *
 */
const PixDiff = require("pix-diff");

//----------------------
// Variable settings
let seleniumURL = "http://#";

if (process.env.DOCKER) {
  seleniumURL = "http://selenium:4444/wd/hub";
} else {
  seleniumURL = "http://localhost:4444/wd/hub";
}

const browserWidth = 1440;
const browserHeight = 800;

// Override and use saucelabs webdriver
// seleniumURL = 'http://ondemand.saucelabs.com:80';

const timeout = 30000;
let multiCapabilities = [{
  "browserName": "chrome",
  "chromeOptions": {
    args: [
      "--no-sandbox",
      "--test-type=browser",
      `--window-size=${browserWidth},${browserHeight}`
    ],
    prefs: {
      "download": {
        "prompt_for_download": false,
        "default_directory": "../downloads/"
      }
    }
  }
}];


//----------------------
// Default settings
let settings = {
  framework: "jasmine",
  seleniumAddress: seleniumURL,
  //--------------------------
  // Use this to run all test files
  // specs: ['specs/*.spec.js'],

  specs: [
    // "tools/take_screenshots.js",
    "specs/auth.spec.js",
    "specs/composer_survey.spec.js",
    "specs/explore.spec.js",
    "specs/home.spec.js",
    "specs/icon_upload.spec.js",
    "specs/image.spec.js",
    "specs/journal.spec.js",
    "specs/search.spec.js",
  ],
  multiCapabilities,
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: timeout * 2
  },
  getPageTimeout: timeout,
  allScriptsTimeout: timeout,
  // Results output file
  resultJsonOutputFile: "./result.json",
  onPrepare: () => {
    // Setup pix-diff directories and resolution
    browser.pixDiff = new PixDiff({
      basePath: "e2e/images/",
      diffPath: "e2e/images/",
      width: browserWidth,
      height: browserHeight
    });

    // Workaround for pending:
    jasmine.Suite.prototype.pend = (message) => {
      this.markedPending = true;
      this.children.forEach(spec => spec.pend(message));
    };
  }
};

//----------------------
// Testing settings
// This overrides the configuration if we are using sauce-connect
if (process.env.DOCKER) {
  seleniumURL = "http://selenium:4444/wd/hub";
  multiCapabilities = [{
    "browserName": "chrome",
    "tags": ["dev"],
    "name": "Mapstory Chrome Tests",
    "chromeOptions": {
      args: [
        "--no-sandbox",
        "--test-type=browser",
        `--window-size=${browserWidth},${browserHeight}`
      ],
      prefs: {
        "download": {
          "prompt_for_download": false,
          "default_directory": "../downloads/"
        }
      }
    }
  }];
  settings = {
    framework: "jasmine",
    seleniumAddress: seleniumURL,
    specs: ["specs/*.spec.js"],
    multiCapabilities,
    jasmineNodeOpts: {
      showColors: true,
      defaultTimeoutInterval: timeout * 2
    },
    getPageTimeout: timeout,
    allScriptsTimeout: timeout,
    resultJsonOutputFile: "./result.json",
    onPrepare:() => {
      browser.pixDiff = new PixDiff({
        basePath: "e2e/images/",
        diffPath: "e2e/images/",
        width: browserWidth,
        height: browserHeight
      });
    }
  };
}

//----------------------
// Testing settings
// This overrides the configuration if we are running inside Travis
if (process.env.TRAVIS) {
  // Use sauce labs for cloud browser testing
  // TODO: Use https!!!
  // seleniumURL = `http://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@ondemand.saucelabs.com/wd/hub`;
  seleniumURL = "http://ondemand.saucelabs.com:80"
  multiCapabilities = [{
    "browserName": "firefox",
    "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER,
    "name": "Mapstory Firefox Tests",
    "build": process.env.TRAVIS_BUILD_NUMBER,
    "tags": [process.env.TRAVIS_PYTHON_VERSION, "CI"]
  }, {
    "browserName": "chrome",
    "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER,
    "build": process.env.TRAVIS_BUILD_NUMBER,
    "tags": [process.env.TRAVIS_PYTHON_VERSION, "CI"],
    "name": "Mapstory Chrome Tests",
    "chromeOptions": {
      args: [
        "--no-sandbox",
        "--test-type=browser",
        `--window-size=${browserWidth},${browserHeight}`
      ],
      prefs: {
        "download": {
          "prompt_for_download": false,
          "default_directory": "../downloads/"
        }
      }
    }
  }];
  settings = {
    framework: "jasmine",
    seleniumAddress: seleniumURL,
    specs: ["specs/*.spec.js"],
    multiCapabilities,
    jasmineNodeOpts: {
      showColors: true,
      defaultTimeoutInterval: timeout * 4
    },
    getPageTimeout: timeout,
    allScriptsTimeout: timeout,
    resultJsonOutputFile: "./result.json",
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    onPrepare: () => {
      browser.pixDiff = new PixDiff({
        basePath: "e2e/images/",
        diffPath: "e2e/images/",
        width: browserWidth,
        height: browserHeight
      });
    }
  };
}

exports.config = settings;
