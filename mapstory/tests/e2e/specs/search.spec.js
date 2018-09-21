require("../tools/waitReady.js");
const waitTimes = require("../tools/wait_times");
const constants = require("../tools/constants");
const search = require("../pages/search.po");
const deafaultWindowHeight = 900;
const defaultWindoWidth = 1400;


describe("Search", () => {
  beforeEach( () => {
    // Fetch Home
    // Search bar cares about window size.
    browser.driver.manage().window().setSize(defaultWindoWidth, deafaultWindowHeight);
    browser.get(constants.baseURL);
    browser.waitForAngular();
  });

  it("> should show search bar even if window size is 400 x 600", () => {
    browser.driver.manage().window().setSize(400, 600);
    browser.get(constants.baseURL);
    browser.waitForAngular();
    search.textInput.isDisplayed().then(function (isVisible) {
      expect(isVisible).toBe(true);
    });
  });

  it("> should show the search bar when window size is 1440 x 900", () => {
    expect(search.searchButton.waitReady()).toBeTruthy();
    search.searchButton.click();
  });

  it("> should search", () => {
    expect(search.searchButton.waitReady()).toBeTruthy();
    search.searchButton.click();
    browser.sleep(waitTimes.search);

    // Expect the url to change to search api
    browser.getCurrentUrl().then( (newURL) => {
      expect(newURL.indexOf("/search/") >= 0).toBeTruthy();
    });
  });

  xit("> should find stories", () => {

  });

  xit("> should find layers", () => {

  });

  xit("> should find all users", () => {
    search.searchFor("");
    expect(search.storyTellerTab.waitReady()).toBeTruthy();
    search.storyTellerTab.click();

    browser.sleep(waitTimes.search);
    expect(search.resultsContainer.waitReady()).toBeTruthy();

    // Refresh search objects
    expect(search.searchResults.count()).toBeTruthy();
  });


  xit("> should search for admin", () => {
    search.searchFor("admin");

    browser.sleep(waitTimes.search);
    expect(search.resultsContainer.waitReady()).toBeTruthy();

    // Refresh search objects
    expect(search.searchResults.count()).toEqual(1);

    search.searchResults.get(0).getText().then( (text) => {
      expect(text.indexOf("admin") >= 0).toBeTruthy();
    });
  });

  xit("> should find a user by name", () => {
    search.searchFor("Moofasa");
    expect(search.storyTellerTab.waitReady()).toBeTruthy();
    search.storyTellerTab.click();

    browser.sleep(waitTimes.search);
    expect(search.resultsContainer.waitReady()).toBeTruthy();

    // Refresh search objects
    expect(search.searchResults.count()).toEqual(1, "Expected to find 1 result!");

    if (search.searchResults.count() > 1) {
      // Test user
      search.searchResults.get(0).getText().then( (text) => {
        expect(text.indexOf("Moofasa")).toBeTruthy();
      });
    }
  });
});
