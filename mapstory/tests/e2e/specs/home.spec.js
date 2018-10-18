/**
 * Mapstory E2E Tests
 * =============================
 * Uses protractor for testing the content served to the browser.
 *
 * How to run E2E tests
 * --------------------
 * 1. Install Protractor: http://www.protractortest.org/
 * 2. Start the webriver: webdriver-manager start
 * 3. Run the tests with `./runE2ETests.sh`
 *
 * Notes
 * -----
 * You can use this tool for finding the right selectors: https://github.com/andresdominguez/elementor
 * After install run: `elementor http://192.168.56.151` to start the tool
 */



require("../tools/waitReady.js");
const wait_times = require("../tools/wait_times");
const constants = require("../tools/constants");

/**
 * Mapstory Home Page
 */
describe("Mapstory Home", () => {
  // Our home page object
  const page = require("../pages/home.po");
  const auth = require("../pages/auth.po");
  const explore_page = require("../pages/explore.po");

  beforeEach(() => {
    // Fetch the site
    browser.get(constants.baseURL);
    browser.waitForAngular();
  });

  it("> should have a title", () => {
    expect(browser.getTitle()).toEqual("MapStory");
  });

  xit("> should be authorized", () => {
    auth.isLoggedIn().then((isLogged) => {
      expect(isLogged).toBeTruthy();
    });
  });

  /**
   * Navigation Bar
   */
  describe("> The \"Navigation Menu\"", () => {
    it("> should navigate to \"Explore\"", () => {
      // Click the link
      expect(page.menu_explore.waitReady()).toBeTruthy();
      page.menu_explore.click();

      // Title should be explore
      expect(browser.getTitle()).toEqual(explore_page.title);
    });

    it("> should navigate to \"Get Started\"", () => {
      expect(element(by.linkText("Get Started")).isDisplayed()).toBe(true);
    });

    it("> should navigate to \"Journal\"", () => {
      expect(element(by.linkText("Journal")).isDisplayed()).toBe(true);
    });

    /**
     * Create
     */
    xdescribe("> \"Create\" menu option", () => {
      beforeEach(() => {
      });

      it("> has a dropdown", () => {
        expect(page.isLoggedIn()).toBeTruthy();
        expect(page.navBar.isDisplayed()).toBe(true);
        page.menuCreate.click();

        // The links inside the dropdown
        expect(page.importLayerLink.waitReady()).toBe(true);
        expect(page.createLayerLink.waitReady()).toBe(true);
        expect(page.uploadIconsLink.waitReady()).toBe(true);
        expect(page.composeStoryLink.waitReady()).toBe(true);
      });

      it("> should show \"Create Layer\"", () => {
        expect(page.isLoggedIn()).toBeTruthy();
        expect(page.navBar.isDisplayed()).toBe(true);
        page.menuCreate.click();

        expect(page.createLayerLink.waitReady()).toBeTruthy();
        page.createLayerLink.click();
      });

      xdescribe("> Create Layer Wizard", () => {
        it("> All steps", (done) => {
          // Open the Create menu
          expect(page.isLoggedIn()).toBeTruthy();
          expect(page.menuCreate.isDisplayed()).toBe(true);
          page.menuCreate.click();

          // Click the create story layer link
          expect(page.createLayerLink.waitReady()).toBeTruthy();
          page.createLayerLink.click();

          page.createLayer_Step1();
          page.createLayer_Step2();
          page.createLayer_Step3();
          page.createLayer_Step4();
          // Temporarily disabled
          // page.createLayer_Step5();
          page.createLayer_Step6();

          done();
        });
      });

      it("> should create layer", () => {
        // Open the Create menu
        expect(page.isLoggedIn()).toBeTruthy();
        expect(page.menuCreate.waitReady())
          .toBeTruthy("\"Create\" was not found in navigation menu");
        page.menuCreate.click();

        // Click the create story layer link
        expect(page.createLayerLink.waitReady()).toBeTruthy();
        page.createLayerLink.click();

        // Do the thing
        page.createStoryLayer();
      });


      it("> should show \"Upload Icons\"", () => {
        expect(page.isLoggedIn()).toBeTruthy();

        expect(page.navBar.isDisplayed()).toBe(true);
        page.menuCreate.click();

        expect(page.uploadIconsLink.waitReady()).toBeTruthy();
        page.uploadIconsLink.click();
      });


      it("> should show \"Compose Story\"", () => {
        expect(page.isLoggedIn()).toBeTruthy();
        expect(page.navBar.isDisplayed()).toBe(true);
        page.menuCreate.click();

        expect(page.composeStoryLink.waitReady()).toBeTruthy();
        page.composeStoryLink.click();
      });

      /**
       * Import Layer Form
       */
      describe("> Import Layer form", () => {

        beforeEach(() => {
          element(by.linkText("Create")).click();
          page.importLayerLink.click();
        });

        it("> has a \"Close button\"", () => {
          const closeButton = element(by.css("i.fa.fa-times.pointer.import-wizard-icon"));
          expect(closeButton.waitReady()).toBeTruthy();
          closeButton.click();
        });

        /**
         * Step 1
         */
        describe("> Step 1", () => {
          it("> should complete step 1", () => {
            page.uploadLayer_Step1();
          });
        });

        /**
         * Step 2
         */
        describe("> Step 2", () => {
          it("should complete step 2", () => {
            page.uploadLayer_Step1();
            page.uploadLayer_Step2();
          });
        });

        /**
         * Step 3
         */
        describe("> Step 3", () => {
          it("> should complete step 3", () => {
            page.uploadLayer_Step1();
            page.uploadLayer_Step2();
            page.uploadLayer_Step3();
          });
        });

        /**
         * Step 4
         */
        describe("> Step 4", () => {
          it("should complete step 4", () => {
            page.uploadLayer_Step1();
            page.uploadLayer_Step2();
            page.uploadLayer_Step3();
            page.uploadLayer_Step4();
          });
        });

        /**
         * Step 5
         */
        describe("> Step 5", () => {
          it("> should complete step 5", () => {
            page.uploadLayer_Step1();
            page.uploadLayer_Step2();
            page.uploadLayer_Step3();
            page.uploadLayer_Step4();
            page.uploadLayer_Step5();
          });

        });

        /**
         * Step 6
         */
        describe("> Step 6", () => {
          it("> should complete step 6", () => {
            page.uploadLayer_Step1();
            page.uploadLayer_Step2();
            page.uploadLayer_Step3();
            page.uploadLayer_Step4();
            page.uploadLayer_Step5();
            page.uploadLayer_Step6();
          });
        });

      });

      describe("> Layer Edit Metadata", () => {
        beforeEach(() => {
          element(by.linkText("Create")).click();
          page.importLayerLink.click();
          page.uploadLayer_Step1();
          page.uploadLayer_Step2();
          page.uploadLayer_Step3();
          page.uploadLayer_Step4();
          page.uploadLayer_Step5();
        });

        it("> Can edit metadata", () => {
          // Complete last step
          page.uploadLayer_Step6();
          browser.sleep(wait_times.metadata_load);

          // Click 'Update Metadata'
          const update_metadata_button = element(by.partialButtonText("Update Metadata"));
          expect(update_metadata_button.waitReady()).toBeTruthy();
          update_metadata_button.click();
          browser.sleep(2000);

          // Expect things to show up on metadata edit
          const titleInput = element(by.css("#id_title"));
          const categoryDropdown = element(by.css("#id_category"));
          const summaryText = element(by.css("#id_abstract"));
          const languageDropdown = element(by.css("#id_language"));
          const dataSourceText = element(by.css("#id_distribution_url"));
          const dataQualityText = element(by.css("#id_data_quality_statement"));
          const purposeText = element(by.css("#id_purpose"));
          const isPublishedCheckbox = element(by.css("#id_is_published"));

          expect(titleInput.waitReady()).toBeTruthy();
          expect(categoryDropdown.waitReady()).toBeTruthy();
          expect(summaryText.waitReady()).toBeTruthy();
          expect(languageDropdown.waitReady()).toBeTruthy();
          expect(dataSourceText.waitReady()).toBeTruthy();
          expect(dataQualityText.waitReady()).toBeTruthy();
          expect(purposeText.waitReady()).toBeTruthy();
          expect(isPublishedCheckbox.waitReady()).toBeTruthy();

          // Click 'Is Published'
          const is_published_checkbox = element(by.css("#id_is_published"));
          expect(is_published_checkbox.waitReady()).toBeTruthy();
          is_published_checkbox.click();

          // Click 'Save'
          const saveButton = element(by.partialButtonText("Save"));
          saveButton.click();
        });
      });
    });
  });
});
