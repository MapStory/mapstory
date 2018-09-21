const homePage = require("../pages/home.po");
const ImagesPage = require("../pages/images.po");

const enabled = false;
const constants = require("../tools/constants");

/**
 * A tool for generating screenshots
 */
if(enabled) {
  describe("Screenshot Bot", () => {

    beforeEach(() => {
      // browser.driver.manage().window().maximize();
      browser.driver.manage().window().setSize(1440, 800);
      browser.driver.manage().window().setPosition(0, 0);
      browser.get(constants.baseURL);
      browser.waitForAngular();
      browser.sleep(1000);
    });

    it("saves the homepage", () => {
      // Scroll to top
      browser.executeScript("window.scrollTo(0,0);").then( () => {
        browser.sleep(1500);
        browser.pixDiff.savePage("homePage");
      });
    });

    it("saves all the little pieces", () => {

      // Scroll to top
      browser.executeScript("window.scrollTo(0,0);").then( () =>  {
        browser.pixDiff.saveRegion(ImagesPage.navbar, "navbar");
      });

    });

    it("saves the login modal", () => {
      homePage.loginIcon.click();
      ImagesPage.loginModal.waitReady();
      browser.sleep(1000);
      // Scroll to top
      browser.executeScript("window.scrollTo(0,0);").then( () => {
        browser.pixDiff.saveRegion(ImagesPage.loginModal, 'loginModal');
      });
    });
  });
}
