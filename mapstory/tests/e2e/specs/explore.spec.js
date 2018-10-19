/**
 * Explore Page e2e Tests
 */



require("../tools/waitReady.js");

describe("Explore page", () => {
  const explorePage = require("../pages/explore.po");

  beforeEach(() => {
    explorePage.get();
  });

  xit("> loads correctly", () => {
    // TODO: Dynamically check for the title
    expect(browser.getTitle()).toEqual(explorePage.title);
    // expect(explorePage.storyteller_search_tab.waitReady()).toBeTruthy();
    // expect(explorePage.search_bar.waitReady()).toBeTruthy();
    // expect(explorePage.search_button.waitReady()).toBeTruthy();
    // expect(explorePage.filter_all.waitReady()).toBeTruthy();
    // expect(explorePage.filter_mapstory.waitReady()).toBeTruthy();
  });
});
