/**
 * Explore Page e2e Tests
 */



import "../tools/waitReady";

const explorePage = require("../pages/explore.po");

describe("Explore page", () => {

  beforeEach(() => {
    explorePage.get();
  });

  xit("> loads correctly", () => {
    // TODO: Dynamically check for the title
    expect(browser.getTitle()).toEqual(explorePage.title);
    // expect(explorePage.storytellerSearchTab.waitReady()).toBeTruthy();
    // expect(explorePage.searchBar.waitReady()).toBeTruthy();
    // expect(explorePage.searchButton.waitReady()).toBeTruthy();
    // expect(explorePage.filterAll.waitReady()).toBeTruthy();
    // expect(explorePage.filterMapStory.waitReady()).toBeTruthy();
  });
});
