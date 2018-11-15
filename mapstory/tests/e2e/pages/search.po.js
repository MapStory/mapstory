/**
 * Search Page Object
 * =========================
 */



import "../tools/waitReady";
import timings from "../tools/wait_times";

const Search = () => {
  this.searchForm = element(by.css(".search-bar"));
  this.textInput = element(by.css("[placeholder=\"Quick Search\"]"));
  this.searchButton = element(by.css("button[type=\"submit\"]"));
  this.storyTellerTab = element(by.partialLinkText("Search for Storytellers"));
  this.resultsContainer = element(by.css(".storyteller-results"));
  this.searchResults = element.all(by.repeater("item in results | filter:itemFilter"));

  this.searchFor = (searchString) =>{
    expect(this.searchButton.waitReady()).toBeTruthy();

    // Send the search text
    this.textInput.sendKeys(searchString);

    this.searchButton.click();
    browser.sleep(timings.search);

    // Expect the url to change to search api
    browser.getCurrentUrl().then((newURL) => {
      expect(newURL.indexOf("/search/") >= 0).toBeTruthy();
    });
  };
};

export default new Search();
