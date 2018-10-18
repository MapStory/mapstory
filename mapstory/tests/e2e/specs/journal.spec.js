/**
 * Journal Spec tests
 */



require("../tools/waitReady.js");
const make_id = require("../tools/make_id");
const screenshot_help = require("../tools/screenshot_helper.js");

// Take screenshots on error
screenshot_help.setup();

describe("Journal Page", () => {
  const journal_page = require("../pages/journal.po");

  beforeEach(() => {
    journal_page.get();
  });

  it("should load correctly", () => {
    expect(browser.getTitle()).toEqual(journal_page.title);
    expect(journal_page.new_entry_button.waitReady()).toBeTruthy();
  });

  xit("can write a new entry", () => {
    // Create a new entry
    const entry_title = `Testing journal post ${  make_id(4)}`;
    const content_id = make_id(12);
    const entry_content = `Some random content to test: ${  content_id}`;
    journal_page.make_new_entry(entry_title, entry_content, true);

    // The entry should now be displayed
    journal_page.get();
    let foundTitle = false;
    // Searches all the jorunal titles for the test title
    element.all(by.css("h1.blog-title")).each((element) => {
      element.getText().then((text) => {
        if (text == entry_title) {
          foundTitle = true;
          return true;
        }
      });
    }).then(() => {
      expect(foundTitle).toBe(true);
    });

    // The correct content should be displayed
    element.all(by.partialLinkText(entry_title)).each((element) => {
      element.getText().then((text) => {
        if (text == entry_title) {
          // Click the link
          element.click();
        }
      });
    }).then(() => {
      browser.waitForAngular();
      // The Content ID should be inside the content

      const content = element(by.css(".col-lg-10.col-xs-6.blog-content.bl"));
      content.getText().then((text) => {
        expect(text).toContain(content_id);
      });

      // Should be able to comment
      const comment_id = make_id(3);
      const test_comment = `This is a test comment: ${  comment_id}`;
      journal_page.comment_box.sendKeys(test_comment);

      const post_comment_button = element(by.buttonText("Post"));
      post_comment_button.click();
    });
  });
});
