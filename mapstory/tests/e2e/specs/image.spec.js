
require("../tools/waitReady.js");

// This is an example of how to use image-diff tests
const PixDiff = require("pix-diff");
const homePage = require("../pages/home.po");
const imagesPage = require("../pages/images.po");
const constants = require("../tools/constants");

describe("Home page image check", () => {

  beforeEach(() => {
    browser.driver.manage().window().setSize(1440, 800);
    browser.driver.manage().window().setPosition(0, 0);
    browser.get(constants.baseURL);
    browser.waitForAngular();
    browser.sleep(1000);
  });

  it("should have pix-diff installed", () => {
    expect(browser.pixDiff).toBeTruthy();
  });

  xit("should match the home page", () => {
    homePage.logout();


    browser.executeScript("window.scrollTo(0,0);").then(() => {
      browser.pixDiff.checkPage("homePage").then(
        result => {
          // 5 means identical!
          expect(result.code).toEqual(PixDiff.RESULT_IDENTICAL);
        }
      );
    });

    browser.executeScript("window.scrollTo(0,0);").then(() => {
      browser.sleep(1200);
      browser.pixDiff.checkRegion(imagesPage.navbar, "navbar").then(
        result => {
          expect(result.code).toEqual(PixDiff.RESULT_IDENTICAL);
        }
      );
    });
  });

  xit("should match login modal", () => {
    homePage.logout();
    homePage.loginIcon.click();
    imagesPage.loginModal.waitReady();
    browser.sleep(1000);

    // Scroll to top
    browser.executeScript("window.scrollTo(0,0);").then(() => {
      browser.pixDiff.checkRegion(imagesPage.loginModal, "loginModal").then(
        result => {
          expect(result.code).toEqual(PixDiff.RESULT_IDENTICAL);
        }
      );
    });
  });
});


