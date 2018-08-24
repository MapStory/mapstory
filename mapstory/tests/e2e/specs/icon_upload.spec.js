const homePage = require("../pages/home.po");
const wizard = require("../pages/icon_upload.po");

// var screenHelper = require('./screenHelper');

describe("Icon Upload Wizard", () => {
  beforeEach( () => {
  });

  // // Take a screenshot automatically after each failing test.
  // afterEach(function() {
  // 	var passed = jasmine.getEnv().currentSpec.results().passed();
  // 	if (!passed) {
  // 		screenHelper.screenshot();
  // 	}
  // });

  it("> should be available to the user from the home page", () => {
    expect(homePage.isLoggedIn()).toBeTruthy();
    expect(homePage.navBar.isDisplayed()).toBe(true);
    homePage.menuCreate.click();
    expect(homePage.uploadIconsLink.waitReady()).toBeTruthy();
    homePage.uploadIconsLink.click();
  }).pend("Fix");

  it("> should upload svg icons", () => {
    expect(homePage.isLoggedIn()).toBeTruthy();
    expect(homePage.navBar.isDisplayed()).toBe(true);
    homePage.menuCreate.click();

    expect(homePage.uploadIconsLink.waitReady()).toBeTruthy();
    homePage.uploadIconsLink.click();

    const tagsInput = element(by.css("#id_tags"));
    expect(tagsInput.waitReady()).toBeTruthy();

    tagsInput.sendKeys("testtag01");

    // Send the file
    const filePath = wizard.getSVGPath();

    const fileInput = element(by.css("#id_svg"));
    expect(fileInput.waitReady()).toBeTruthy();

    fileInput.sendKeys(filePath);

    // Press send
    const uploadButton = element(by.css("#icon_submit_btn"));
    expect(uploadButton.waitReady()).toBeTruthy();

    uploadButton.click();

    // Expect success:
    const successAlert = element(by.css(".alert.alert-success"));
    expect(successAlert.waitReady()).toBeTruthy();

    successAlert.getText( (text) => {
      expect(text).toEqual(wizard.getSuccessText());
    });
  }).pend("Fix");

  it("> should reject non svg files", () => {
    expect(homePage.isLoggedIn()).toBeTruthy();
    expect(homePage.navBar.isDisplayed()).toBe(true);
    homePage.menuCreate.click();

    expect(homePage.uploadIconsLink.waitReady()).toBeTruthy();
    homePage.uploadIconsLink.click();

    const tagsInput = element(by.css("#id_tags"));
    expect(tagsInput.waitReady()).toBeTruthy();

    tagsInput.sendKeys("testtag00");

    // Send the file
    const filePath = wizard.getPNGPath();

    const fileInput = element(by.css("#id_svg"));
    expect(fileInput.waitReady()).toBeTruthy();

    fileInput.sendKeys(filePath);

    // Press send
    const uploadButton = element(by.css("#icon_submit_btn"));
    expect(uploadButton.waitReady()).toBeTruthy();

    uploadButton.click();

    // Expect no success:
    const successAlert = element(by.css(".alert.alert-success"));
    successAlert.isPresent( (visible) => {
      expect(visible).toBe(false);
    });
  }).pend("Fix");
});
