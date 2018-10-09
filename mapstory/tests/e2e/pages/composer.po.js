/**
 * Composer Page Object
 * ====================
 */
"use strict";

require("../tools/waitReady.js");

let make_id = require("../tools/make_id.js");
let wait_times = require("../tools/wait_times.js");
let constants = require("../tools/constants");

/**
 * Composer Page Object
 */
let composer = function () {


  this.startComposingLink = $("#start-composing");
  this.welcome_modal = $(".modal-content");
  this.go_back_home = element(by.linkText("Return to MapStory Home"));
  this.compose_story = element(by.linkText("Compose Story"));
  this.take_tour = element(by.linkText("Take a Tour"));
  this.tour_number = $(".hopscotch-bubble-number");
  this.tour_next_button = $(".hopscotch-nav-button.next.hopscotch-next");
  this.map_properties = $("#mapProperties");
  this.map_properties_header = this.map_properties.element(by.css(".modal-header")).element(by.css(".modal-title.ng-scope.ng-binding"));
  this.map_properties_title_text = this.map_properties.element(by.css("#mapTitle"));
  this.map_properties_summary_text = this.map_properties.element(by.css("#mapAbstract"));
  this.map_properties_category_dropdown = this.map_properties.element(by.css("#id_category"));
  this.map_properties_tags_text = this.map_properties.element(by.css("#mapKeywords"));
  this.map_properties_location_dropdown = this.map_properties.element(by.css("#mapRegions"));
  this.map_properties_save_button = this.map_properties.element(by.buttonText("Save"));
  this.story_title = element(by.css("#mapstory-title"));
  this.story_chapter_01_div = element(by.css(".menuItem.ng-scope"));
  this.story_chapter_01_link = this.story_chapter_01_div.element(by.css("a"));
  this.publish_link = element(by.css("span[style=\"display: inline-block;width: 25%;float: left;text-align: center;\"]"))
  this.confirm_publish_button = element(by.buttonText("Publish"));
  this.new_chapter_button = element(by.buttonText("Add New Chapter"));
  this.table_of_contents_button = element(by.linkText("Table of Contents"));
  // this.table_of_contents = $('.sidebar-toc-content');
  this.chapter_binds = $(".sidebar-toc-content").all(by.binding("chapter"));
  this.storypins_button = $("[ng-click=\"updateSelected('pins')\"]");
  this.add_storypin_button = $("[ng-click=\"on_add_storypin()\"]");
  this.storypin_binds = $("#pin-list").all(by.binding("pin"));
  this.bulk_upload_button = element(by.buttonText("Bulk Upload"));
  this.upload_modal = $("#modal-body");
  this.csv_button = this.upload_modal.$("#bulk_pin_csv_file");
  this.storypins = element.all(by.css(".storypin-content"));
  this.edit_story = $("[ng-click=\"openStoryModal()\"]");
  this.edit_story_title = element(by.model("stateSvc.config.about.title"));
  this.edit_story_summary = element(by.model("stateSvc.config.about.abstract"));
  this.edit_category = element(by.model("stateSvc.config.about.category"));
  this.edit_save_button = $(".modal-footer").element(by.buttonText("Save"));

  /**
   * Gets the Composer page
   */
  this.get = function () {
    // Angular sync fails on Composer. So we need to turn it off
    browser.ignoreSynchronization = true;
    let url = constants.baseURL + "/story/new?tour";
    browser.get(url);
    browser.sleep(wait_times["composer_tour_modal"]);
  };

  /**
   * Generates a random story title
   * @param  {uint} length Length of random ID (Defaults to 5)
   * @return {String}        A random story title
   */
  this.makeRandomTitle = function (length) {
    return "test_story_" + make_id(length);
  };

};

module.exports = new composer();
