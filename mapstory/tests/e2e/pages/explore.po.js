/**
 * Explore Page Object
 * ===================
 *
 * Describes the explore page for e2e testing
 */

require("../tools/waitReady.js");
const constants = require("../tools/constants");

function ExplorePageObject() {
  this.title = "Explore - MapStory";
  this.contentSearchBar = $("#content-search");
  this.storytellerSearchTab = $("#user-search");
  this.searchBar = $("#text_search_input");
  this.searchButton = $("#text_search_btn");
  this.filterAll = element(by.linkText("All"));
  this.filterMapstory = element(by.partialLinkText("MapStory"));
  this.filterLayer = element(by.partialLinkText("StoryLayer"));
  this.sortPopular = element(by.linkText("Popular"));
  this.sortNewest = element(by.linkText("Newest"));

  this.get = () => {
    browser.get(`${constants.baseURL}/search`);
    browser.waitForAngular();
  };
};

module.exports = new ExplorePageObject();
