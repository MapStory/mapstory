/**
 * Composer Page Object
 * ====================
 */



import "../tools/waitReady";

import makeID from "../tools/make_id";
import timings from "../tools/wait_times";
import { baseURL } from "../tools/constants";

/**
 * Composer Page Object
 */
class Composer {
  constructor() {
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
    this.publishLink = element(by.css("span[style=\"display: inline-block;width: 25%;float: left;text-align: center;\"]"));
    this.confirmPublishButton = element(by.buttonText("Publish"));
    this.newChapterButton = element(by.buttonText("Add New Chapter"));
    this.tableOfContentsButton = element(by.linkText("Table of Contents"));
    // this.table_of_contents = $('.sidebar-toc-content');
    this.chapterBinds = $(".sidebar-toc-content").all(by.binding("chapter"));
    this.storyPinsButton = $("[ng-click=\"updateSelected('pins')\"]");
    this.addStoryPinButton = $("[ng-click=\"onAddStoryPin()\"]");
    this.storyPinBinds = $("#pin-list").all(by.binding("pin"));
    this.bulkUploadButton = element(by.buttonText("Bulk Upload"));
    this.uploadModal = $("#modal-body");
    this.csvButton = this.uploadModal.$("#bulk_pin_csv_file");
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
      const url = `${baseURL}/story/new?tour`;
      browser.get(url);
      browser.sleep(timings.composerTourModal);
    };
    /**
     * Generates a random story title
     * @param  {uint} length Length of random ID (Defaults to 5)
     * @return {String}        A random story title
     */
    this.makeRandomTitle = (length) => `testStory${makeID(length)}`;
  }
}

export default new Composer();