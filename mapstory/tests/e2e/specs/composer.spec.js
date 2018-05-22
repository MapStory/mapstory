/**
 * Composer E2E Tests
 * ==================
 */
"use strict";

let page = require("../pages/composer.po.js");
let home = require("../pages/home.po.js");
const auth = require("../pages/auth.po");
let wait_times = require("../tools/wait_times.js");
let constants = require("../tools/constants");

describe("Composer", function () {
  // Our home page object
  beforeEach(function () {
    // Fetch Home
    browser.ignoreSynchronization = true;
  });

  it("> should start logged in", function () {
    browser.get(constants.baseURL);
    auth.login("admin", "admin");
  });

  it("> should begin creating", function () {
    page.get();
    expect(page.compose_story.waitReady()).toBeTruthy();
    page.compose_story.click();
    expect(page.map_properties.waitReady()).toBeTruthy();
  });
});
