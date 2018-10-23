/**
 * Explore Page Object
 * ===================
 *
 * Describes the explore page for e2e testing
 */



import "../tools/waitReady";
import { baseURL } from "../tools/constants";

const ExplorePageObject = () => {
  this.title = "Explore - MapStory";
  this.contentSearchTab = $("#content-search");
  this.storytellerSearchTab = $("#user-search");
  this.searchBar = $("#text_search_input");
  this.searchButton = $("#text_search_btn");
  this.filterAll = element(by.linkText("All"));
  this.filterMapStory = element(by.partialLinkText("MapStory"));
  this.filterLayer = element(by.partialLinkText("StoryLayer"));
  this.sortPopular = element(by.linkText("Popular"));
  this.sortNewest = element(by.linkText("Newest"));

  this.get = () => {
    browser.get(`${baseURL  }/search`);
    browser.waitForAngular();
  };
};

export default new ExplorePageObject();
