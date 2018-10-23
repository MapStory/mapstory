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



import "../tools/waitReady";
import { metadataLoad } from "../tools/wait_times";
import { baseURL } from "../tools/constants";
import { menuExplore, isLoggedIn, navBar, menuCreate, importLayerLink, createLayerLink, uploadIconsLink, composeStoryLink, createLayerStep1, createLayerStep2, createLayerStep3, createLayerStep4, createLayerStep6, createStoryLayer, uploadLayerStep1, uploadLayerStep2, uploadLayerStep3, uploadLayerStep4, uploadLayerStep5, uploadLayerStep6 } from "../pages/home.po";
import { isLoggedIn as _isLoggedIn } from "../pages/auth.po";
import { title } from "../pages/explore.po";

/**
 * Mapstory Home Page
 */
describe("Mapstory Home", () => {

  beforeEach(() => {
    // Fetch the site
    browser.get(baseURL);
    browser.waitForAngular();
  });

  it("> should have a title", () => {
    expect(browser.getTitle()).toEqual("MapStory");
  });

  xit("> should be authorized", () => {
    _isLoggedIn().then((isLogged) => {
      expect(isLogged).toBeTruthy();
    });
  });

  /**
   * Navigation Bar
   */
  describe("> The \"Navigation Menu\"", () => {
    it("> should navigate to \"Explore\"", () => {
      // Click the link
      expect(menuExplore.waitReady()).toBeTruthy();
      menuExplore.click();

      // Title should be explore
      expect(browser.getTitle()).toEqual(title);
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
        expect(isLoggedIn()).toBeTruthy();
        expect(navBar.isDisplayed()).toBe(true);
        menuCreate.click();

        // The links inside the dropdown
        expect(importLayerLink.waitReady()).toBe(true);
        expect(createLayerLink.waitReady()).toBe(true);
        expect(uploadIconsLink.waitReady()).toBe(true);
        expect(composeStoryLink.waitReady()).toBe(true);
      });

      it("> should show \"Create Layer\"", () => {
        expect(isLoggedIn()).toBeTruthy();
        expect(navBar.isDisplayed()).toBe(true);
        menuCreate.click();

        expect(createLayerLink.waitReady()).toBeTruthy();
        createLayerLink.click();
      });

      xdescribe("> Create Layer Wizard", () => {
        it("> All steps", (done) => {
          // Open the Create menu
          expect(isLoggedIn()).toBeTruthy();
          expect(menuCreate.isDisplayed()).toBe(true);
          menuCreate.click();

          // Click the create story layer link
          expect(createLayerLink.waitReady()).toBeTruthy();
          createLayerLink.click();

          createLayerStep1();
          createLayerStep2();
          createLayerStep3();
          createLayerStep4();
          // Temporarily disabled
          // page.createLayer_Step5();
          createLayerStep6();

          done();
        });
      });

      it("> should create layer", () => {
        // Open the Create menu
        expect(isLoggedIn()).toBeTruthy();
        expect(menuCreate.waitReady())
          .toBeTruthy("\"Create\" was not found in navigation menu");
        menuCreate.click();

        // Click the create story layer link
        expect(createLayerLink.waitReady()).toBeTruthy();
        createLayerLink.click();

        // Do the thing
        createStoryLayer();
      });


      it("> should show \"Upload Icons\"", () => {
        expect(isLoggedIn()).toBeTruthy();

        expect(navBar.isDisplayed()).toBe(true);
        menuCreate.click();

        expect(uploadIconsLink.waitReady()).toBeTruthy();
        uploadIconsLink.click();
      });


      it("> should show \"Compose Story\"", () => {
        expect(isLoggedIn()).toBeTruthy();
        expect(navBar.isDisplayed()).toBe(true);
        menuCreate.click();

        expect(composeStoryLink.waitReady()).toBeTruthy();
        composeStoryLink.click();
      });

      /**
       * Import Layer Form
       */
      describe("> Import Layer form", () => {

        beforeEach(() => {
          element(by.linkText("Create")).click();
          importLayerLink.click();
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
            uploadLayerStep1();
          });
        });

        /**
         * Step 2
         */
        describe("> Step 2", () => {
          it("should complete step 2", () => {
            uploadLayerStep1();
            uploadLayerStep2();
          });
        });

        /**
         * Step 3
         */
        describe("> Step 3", () => {
          it("> should complete step 3", () => {
            uploadLayerStep1();
            uploadLayerStep2();
            uploadLayerStep3();
          });
        });

        /**
         * Step 4
         */
        describe("> Step 4", () => {
          it("should complete step 4", () => {
            uploadLayerStep1();
            uploadLayerStep2();
            uploadLayerStep3();
            uploadLayerStep4();
          });
        });

        /**
         * Step 5
         */
        describe("> Step 5", () => {
          it("> should complete step 5", () => {
            uploadLayerStep1();
            uploadLayerStep2();
            uploadLayerStep3();
            uploadLayerStep4();
            uploadLayerStep5();
          });

        });

        /**
         * Step 6
         */
        describe("> Step 6", () => {
          it("> should complete step 6", () => {
            uploadLayerStep1();
            uploadLayerStep2();
            uploadLayerStep3();
            uploadLayerStep4();
            uploadLayerStep5();
            uploadLayerStep6();
          });
        });

      });

      describe("> Layer Edit Metadata", () => {
        beforeEach(() => {
          element(by.linkText("Create")).click();
          importLayerLink.click();
          uploadLayerStep1();
          uploadLayerStep2();
          uploadLayerStep3();
          uploadLayerStep4();
          uploadLayerStep5();
        });

        it("> Can edit metadata", () => {
          // Complete last step
          uploadLayerStep6();
          browser.sleep(metadataLoad);

          // Click 'Update Metadata'
          const updateMetadataButton = element(by.partialButtonText("Update Metadata"));
          expect(updateMetadataButton.waitReady()).toBeTruthy();
          updateMetadataButton.click();
          browser.sleep(2000);

          // Expect things to show up on metadata edit
          const titleInput = element(by.css("#id_title"));
          const categoryDropdown = element(by.css("#id_category"));
          const summaryText = element(by.css("#id_abstract"));
          const languageDropdown = element(by.css("#id_language"));
          const dataSourceText = element(by.css("#id_distribution_url"));
          const dataQualityText = element(by.css("#id_data_quality_statement"));
          const purposeText = element(by.css("#id_purpose"));
          let isPublishedCheckbox = element(by.css("#id_is_published"));

          expect(titleInput.waitReady()).toBeTruthy();
          expect(categoryDropdown.waitReady()).toBeTruthy();
          expect(summaryText.waitReady()).toBeTruthy();
          expect(languageDropdown.waitReady()).toBeTruthy();
          expect(dataSourceText.waitReady()).toBeTruthy();
          expect(dataQualityText.waitReady()).toBeTruthy();
          expect(purposeText.waitReady()).toBeTruthy();
          expect(isPublishedCheckbox.waitReady()).toBeTruthy();

          // Click 'Is Published'
          isPublishedCheckbox = element(by.css("#id_is_published"));
          expect(isPublishedCheckbox.waitReady()).toBeTruthy();
          isPublishedCheckbox.click();

          // Click 'Save'
          const saveButton = element(by.partialButtonText("Save"));
          saveButton.click();
        });
      });
    });
  });
});
