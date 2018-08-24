/**
 * Journal Spec tests
 */
require("../tools/waitReady.js");
const makeID = require("../tools/make_id");
// const screenshotHelper = require("../tools/screenshot_helper.js");
const journalPage= require("../pages/journal.po");
// Take screenshots on error
// screenshotHelper.setup();

describe("Journal Page", () => {


  beforeEach( () => {
    journalPage.get();
  });

  it("should load correctly", () => {
    expect(browser.getTitle()).toEqual(journalPage.title);
    expect(journalPage.new_entry_button.waitReady()).toBeTruthy();
  });

  xit("can write a new entry", () => {
    // Create a new entry
    const entryTitle = `Testing journal post ${makeID(4)}`;
    const contentID = makeID(12);
    const entryContent = `Some random content to test: ${contentID}`;
    journalPage.make_new_entry(entryTitle, entryContent, true);

    // The entry should now be displayed
    journalPage.get();
    let foundTitle = false;
    // Searches all the jorunal titles for the test title
    element.all(by.css("h1.blog-title")).each( (element) => {
      element.getText().then( (text) => {
        if (text === entryTitle) {
          foundTitle = true;
          return true;
        }
      });
    }).then(() => {
      expect(foundTitle).toBe(true);
    });

    // The correct content should be displayed
    element.all(by.partialLinkText(entryTitle)).each( (element) => {
      element.getText().then( (text) => {
        if (text === entryTitle) {
          // Click the link
          element.click();
        }
      });
    }).then(() => {
      browser.waitForAngular();
      // The Content ID should be inside the content

      const content = element(by.css(".col-lg-10.col-xs-6.blog-content.bl"));
      content.getText().then((text) => {
        expect(text).toContain(contentID);
      });

      // Should be able to comment
      const commentID = makeID(3);
      const testComment = `This is a test comment: ${commentID}`;
      journalPage.comment_box.sendKeys(testComment);

      const postCommentButton = element(by.buttonText("Post"));
      postCommentButton.click();
    });
  });
});
