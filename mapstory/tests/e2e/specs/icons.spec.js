/**
 * Composer E2E Tests
 * ==================
 */



require("../tools/waitReady.js");
const gifUpload = require("../pages/gif_upload.po");
const composer = require("../pages/composer.po");
const makeNewID = require("../tools/make_id");

describe("Composer", () => {
  // Our home page object
  beforeEach(() => {
    // Fetch Home
    browser.ignoreSynchronization = true;
  });

  xit("should upload a gif as a thumbnail", () => {
    gifUpload.get();

    // Click compose story
    expect(composer.composeStory.waitReady()).toBeTruthy();
    composer.composeStory.click();

    // Setup the story properties
    expect(composer.mapPropertiesTitleText.waitReady()).toBeTruthy();
    composer.mapPropertiesTitleText.sendKeys(`Testing Title${  makeNewID(5)}`);
    composer.mapPropertiesSummaryText.sendKeys("Some test summary here");

    // Click save
    composer.mapPropertiesSaveButton.click();

    expect(composer.publishLink.waitReady()).toBeTruthy();
    composer.publishLink.click();


  });

  /*
      it('should fail here :)', () => {
         expect(true).toBe(false);
      });
  */
});

