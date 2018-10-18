/**
 * Journal Page Object
 * ===================
 */



require("../tools/waitReady.js");
const auth = require("./auth.po");
const home_page = require("./home.po");
const constants = require("../tools/constants");

/* global element, by, browser */

const JournalPageObject = function () {
  this.title = "MapStory";
  this.banner = $(".parallax");
  this.h1 = this.banner.$("h1");
  this.new_entry_button = element(by.partialButtonText("write an entry"));
  this.pageCurrent = $(".page-current");
  this.new_title_input = $("#id_title");
  this.new_content_input = $("#id_content");
  this.new_publish_option = $("#id_publish");
  this.new_save_button = element(by.buttonText("Save"));
  this.comment_box = $("#id_comment");
  this.get = function () {
    browser.get(`${constants.baseURL  }/journal`);
    browser.waitForAngular();
  };
  this.make_new_entry = function (title, content, published) {
    const userAvatar = element(by.css(".nav-avatar"));

    userAvatar.isPresent().then((present) => {
      if (present === false) {
        home_page.get();
        auth.login("admin", "admin");
      }
    });


    this.get();
    this.new_entry_button.click();
    browser.waitForAngular();
    this.new_title_input.sendKeys(title);
    this.new_content_input.sendKeys(content);
    if (published === true) {
      this.new_publish_option.click();
    }
    this.new_save_button.click();
  };
};

module.exports = new JournalPageObject();
