/**
 * Home Page E2E
 */
require("../tools/waitReady.js");
const waitTimes = require("../tools/wait_times");
const constants = require("../tools/constants");
const page = require("../pages/home.po");
const auth = require("../pages/auth.po");
const explorePage = require("../pages/explore.po");

/**
 * Mapstory Home Page
 */
describe("Mapstory Home",() => {
  // Our home page object
  beforeEach( () => {
    // Fetch the site
    browser.get(constants.baseURL);
    browser.waitForAngular();
  });

  it("> should have a title", () => {
    expect(browser.getTitle()).toEqual("MapStory");
  });

  xit("> should be authorized", () => {
    auth.isLoggedIn().then( (isLogged) => {
      expect(isLogged).toBeTruthy();
    });
  });

  /**
   * Navigation Bar
   */
  // "> The \"Navigation Menu\""
  it("> should navigate to \"Explore\"", () => {
    // Click the link
    expect(page.menuExplore.waitReady()).toBeTruthy();
    page.menuExplore.click();

    // Title should be explore
    expect(browser.getTitle()).toEqual(explorePage.title);
  });

  it("> should navigate to \"Get Started\"", () => {
    expect(element(by.linkText("Get Started")).isDisplayed()).toBe(true);
  });

  it("> should navigate to \"Journal\"", () => {
    expect(element(by.linkText("Journal")).isDisplayed()).toBe(true);
  });
});

describe("> \"Create\" menu option", () => {
  beforeEach( () => {
    browser.get(constants.baseURL);
    browser.waitForAngular();
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
  }).pend("Fix");

  it("> should show \"Create Layer\"", () => {
    expect(page.isLoggedIn()).toBeTruthy();
    expect(page.navBar.isDisplayed()).toBe(true);
    page.menuCreate.click();

    expect(page.createLayerLink.waitReady()).toBeTruthy();
    page.createLayerLink.click();
  }).pend("Fix");

  it("> All steps", (done) => {
    // Open the Create menu
    expect(page.isLoggedIn()).toBeTruthy();
    expect(page.menuCreate.isDisplayed()).toBe(true);
    page.menuCreate.click();

    // Click the create story layer link
    expect(page.createLayerLink.waitReady()).toBeTruthy();
    page.createLayerLink.click();

    page.createLayerStep1();
    page.createLayerStep2();
    page.createLayerStep3();
    page.createLayerStep4();
    // Temporarily disabled
    // page.createLayerStep5();
    page.createLayerStep6();
    // Async done
    done();
  }).pend("Fix");

  it("> should create layer", () => {
    // Open the Create menu
    expect(page.isLoggedIn()).toBeTruthy();
    expect(page.menuCreate.waitReady()).toBeTruthy("\"Create\" was not found in navigation menu");
    page.menuCreate.click();

    // Click the create story layer link
    expect(page.createLayerLink.waitReady()).toBeTruthy();
    page.createLayerLink.click();

    // Do the thing
    page.createStoryLayer();
  }).pend("Fix");


  it("> should show \"Upload Icons\"", () => {
    expect(page.isLoggedIn()).toBeTruthy();

    expect(page.navBar.isDisplayed()).toBe(true);
    page.menuCreate.click();

    expect(page.uploadIconsLink.waitReady()).toBeTruthy();
    page.uploadIconsLink.click();
  }).pend("Fix");


  it("> should show \"Compose Story\"", () => {
    expect(page.isLoggedIn()).toBeTruthy();
    expect(page.navBar.isDisplayed()).toBe(true);
    page.menuCreate.click();

    expect(page.composeStoryLink.waitReady()).toBeTruthy();
    page.composeStoryLink.click();
  }).pend("Fix");
});

/**
 * Import Layer Form
 */
describe("> Import Layer form", () => {

  beforeEach( () => {
    browser.get(constants.baseURL);
    browser.waitForAngular();
    element(by.linkText("Create")).click();
    page.importLayerLink.click();
  });

  it("> has a \"Close button\"", () => {
    const closeButton = element(by.css("i.fa.fa-times.pointer.import-wizard-icon"));
    expect(closeButton.waitReady()).toBeTruthy();
    closeButton.click();
  }).pend("Fix");

  /**
   * Upload a layer
   */
  it("> should complete all steps", () => {
    page.uploadLayerStep1();
    page.uploadLayerStep2();
    page.uploadLayerStep3();
    page.uploadLayerStep4();
    page.uploadLayerStep5();
    page.uploadLayerStep6();
  }).pend("Fix");
});

describe("> Layer Edit Metadata", () => {
  beforeEach( () => {
    browser.get(constants.baseURL);
    browser.waitForAngular();
    element(by.linkText("Create")).click();
    page.importLayerLink.click();
    page.uploadLayerStep1();
    page.uploadLayerStep2();
    page.uploadLayerStep3();
    page.uploadLayerStep4();
    page.uploadLayerStep5();
  });

  it("> Can edit metadata", () => {
    // Complete last step
    page.uploadLayerStep6();
    browser.sleep(waitTimes.metadata_load);

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
    expect(isPublishedCheckbox.waitReady()).toBeTruthy();
    isPublishedCheckbox.click();

    // Click 'Save'
    const saveButton = element(by.partialButtonText("Save"));
    saveButton.click();
  }).pend("Fix");
});
