/**
 * Composer E2E Tests
 * ==================
 */



const page = require("../pages/composer.po.js");
const home = require("../pages/home.po.js");
const auth = require("../pages/auth.po");
const wait_times = require("../tools/wait_times.js");
const constants = require("../tools/constants");

describe("Composer", () => {
  // Our home page object
  beforeEach(() => {
    // Fetch Home
    browser.ignoreSynchronization = true;
  });

  it("> should start logged in", () => {
    browser.get(constants.baseURL);
    auth.login("admin", "admin");
  });

  it("> should begin creating", () => {
    page.get();
    expect(page.compose_story.waitReady()).toBeTruthy();
    page.compose_story.click();
    expect(page.map_properties.waitReady()).toBeTruthy();
  });
});
