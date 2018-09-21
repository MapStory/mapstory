/**
 * Journal Page Object
 * ===================
 */

require("../tools/waitReady.js");
const auth = require("./auth.po");
const HomePage = require("./home.po");
const constants = require("../tools/constants");

/* global element, by, browser */

function JournalPageObject() {
  this.title = "MapStory";
  this.banner = $(".parallax");
  this.h1 = this.banner.$("h1");
  this.newEntryButton = element(by.partialButtonText("write an entry"));
  this.pageCurrent = $(".page-current");
  this.newTitleInput = $("#id_title");
  this.newContentInput = $("#id_content");
  this.newPublishOption = $("#id_publish");
  this.newSaveButton = element(by.buttonText("Save"));
  this.commentBox = $("#id_comment");
  this.get = () => {
    browser.get(`${constants.baseURL}/journal`);
    browser.waitForAngular();
  };
  this.makeNewEntry = (title, content, published) => {
    const userAvatar = element(by.css(".nav-avatar"));

    userAvatar.isPresent().then((present) => {
      if (present === false) {
        HomePage.get();
        auth.login("admin", "admin");
      }
    });


    this.get();
    this.newEntryButton.click();
    browser.waitForAngular();
    this.newTitleInput.sendKeys(title);
    this.newContentInput.sendKeys(content);
    if (published === true) {
      this.newPublishOption.click();
    }
    this.newSaveButton.click();
  };
};

module.exports = new JournalPageObject();
