/**
 * Composer Page Object
 * ====================
 */
require("../tools/waitReady.js");

const makeID = require("../tools/make_id.js");
const waitTimes = require("../tools/wait_times.js");
const constants = require("../tools/constants");

/**
 * Composer Page Object
 */
function Composer() {
  this.startComposingLink = $("#start-composing");
  this.welcomeModal = $(".modal-content");
  this.goBackHome = element(by.linkText("Return to MapStory Home"));
  this.composeStory = element(by.linkText("Compose Story"));
  this.takeTour = element(by.linkText("Take a Tour"));
  this.tourNumber = $(".hopscotch-bubble-number");
  this.tourNextButton = $(".hopscotch-nav-button.next.hopscotch-next");
  this.mapProperties = $("#mapProperties");
  this.mapPropertiesHeader = this.mapProperties.element(by.css(".modal-header")).element(by.css(".modal-title.ng-scope.ng-binding"));
  this.mapPropertiesTitleText = this.mapProperties.element(by.css("#mapTitle"));
  this.mapPropertiesSummaryText = this.mapProperties.element(by.css("#mapAbstract"));
  this.mapPropertiesCategoryDropdown = this.mapProperties.element(by.css("#id_category"));
  this.mapPropertiesTagsText = this.mapProperties.element(by.css("#mapKeywords"));
  this.mapPropertiesLocationDropdown = this.mapProperties.element(by.css("#mapRegions"));
  this.mapPropertiesSaveButton = this.mapProperties.element(by.buttonText("Save"));
  this.storyTitle = element(by.css("#mapstory-title"));
  this.storyChapter01Div = element(by.css(".menuItem.ng-scope"));
  this.storyChapter01Link = this.storyChapter01Div.element(by.css("a"));
  this.publishLink = element(by.css("span[style=\"display: inline-block;width: 25%;float: left;text-align: center;\"]"))
  this.confirmPublishButton = element(by.buttonText("Publish"));
  this.newChapterButton = element(by.buttonText("Add New Chapter"));
  this.tableOfContentsButton = element(by.linkText("Table of Contents"));
  this.chapterBinds = $(".sidebar-toc-content").all(by.binding("chapter"));
  this.storypinsButton = $("[ng-click=\"updateSelected('pins')\"]");
  this.addStorypinButton = element(by.buttonText("New StoryPin"));
  this.storypinBinds = $("#pins-editor").all(by.binding("pin"));
  this.bulkUploadButton = element(by.buttonText("Bulk Upload"));
  this.uploadModal = $("#modal-body");
  this.CSVButton = this.uploadModal.$("#bulk_pin_csv_file");
  this.saveStorypinButton = $("[ng-click=\"saveMap()\"]");
  this.storypins = element.all(by.css(".storypin-content"));
  this.editStory = $("[ng-click=\"openStoryModal()\"]");
  this.editStoryTitle = element(by.model("stateSvc.config.about.title"));
  this.editStorySummary = element(by.model("stateSvc.config.about.abstract"));
  this.editCategory = element(by.model("stateSvc.config.about.category"));
  this.editSaveButton = $(".modal-footer").element(by.buttonText("Save"));

  /**
   * Gets the Composer page
   */
  this.get = () => {
    // Angular sync fails on Composer. So we need to turn it off
    browser.ignoreSynchronization = true;
    const url = `${constants.baseURL}/story/new?tour`;
    browser.get(url);
    browser.sleep(waitTimes.composer_tour_modal);
  };

  /**
   * Generates a random story title
   * @param  {uint} length Length of random ID (Defaults to 5)
   * @return {String}        A random story title
   */
  this.makeRandomTitle = (length) => {
    return `test_story_${makeID(length)}`;
  };

};

module.exports = new Composer();
