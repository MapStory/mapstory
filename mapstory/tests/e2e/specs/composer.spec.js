/**
 * Composer E2E Tests
 * ==================
 */



const page = require("../pages/composer.po.js");
const auth = require("../pages/auth.po");
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
    expect(page.composeStory.waitReady()).toBeTruthy();
    page.composeStory.click();
    expect(page.mapProperties.waitReady()).toBeTruthy();
  });
});
