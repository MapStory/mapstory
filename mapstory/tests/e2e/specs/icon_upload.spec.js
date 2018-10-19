

const home_page = require("../pages/home.po");
const wizard = require("../pages/icon_upload.po");

// var screenHelper = require('./screenHelper');

xdescribe("Icon Upload Wizard", () => {
  beforeEach(() => {
  });

  // // Take a screenshot automatically after each failing test.
  // afterEach(function() {
  // 	var passed = jasmine.getEnv().currentSpec.results().passed();
  // 	if (!passed) {
  // 		screenHelper.screenshot();
  // 	}
  // });

  it("> should be available to the user from the home page", () => {
    expect(home_page.isLoggedIn()).toBeTruthy();
    expect(home_page.navBar.isDisplayed()).toBe(true);
    home_page.menuCreate.click();
    expect(home_page.uploadIconsLink.waitReady()).toBeTruthy();
    home_page.uploadIconsLink.click();
  });

  it("> should upload svg icons", () => {
    expect(home_page.isLoggedIn()).toBeTruthy();
    expect(home_page.navBar.isDisplayed()).toBe(true);
    home_page.menuCreate.click();

    expect(home_page.uploadIconsLink.waitReady()).toBeTruthy();
    home_page.uploadIconsLink.click();

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

    successAlert.getText((text) => {
      expect(text).toEqual(wizard.getSuccessText());
    });
  });

  it("> should reject non svg files", () => {
    expect(home_page.isLoggedIn()).toBeTruthy();
    expect(home_page.navBar.isDisplayed()).toBe(true);
    home_page.menuCreate.click();

    expect(home_page.uploadIconsLink.waitReady()).toBeTruthy();
    home_page.uploadIconsLink.click();

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
    successAlert.isPresent((visible) => {
      expect(visible).toBe(false);
    });
  });
});
