

/**
 * User auth tests
 * ================
 */

import "../tools/waitReady";
import { baseURL } from "../tools/constants";
import AuthWizard from "../pages/auth.po";

const EC = protractor.ExpectedConditions;

describe("User auth", () => {

  beforeEach(() => {
    // Fetch Home
    browser.get(baseURL);
    browser.waitForAngular();
  });

  /**
   * Login Button
   */
  it("Should display a Login Form", (done) => {

    AuthWizard.loginIcon.isDisplayed().then((displayed) => {

      if (displayed === false) {
        AuthWizard.logout();
      }

      expect(AuthWizard.loginIcon.waitReady()).toBeTruthy();

      AuthWizard.loginIcon.click();
      expect(AuthWizard.loginForm.waitReady()).toBeTruthy();

      // Jasmine has problems with async. Need to manually specify were done here.
      done();
    });
  });

  /**
   * The Auth Form
   */
  describe("The \"Login Form\"", () => {

    beforeEach(() => {
    });

    it("should have \"Log In\" and \"Sign up\" tabs", () => {
      expect(AuthWizard.loginIcon.isDisplayed()).toBeTruthy();
      expect(AuthWizard.loginIcon.waitReady()).toBeTruthy();

      // Click login
      AuthWizard.loginIcon.click();
      expect(AuthWizard.loginModal.waitReady()).toBe(true);
      expect(element(by.linkText("Log In")).isPresent()).toBe(true);
      expect(element(by.linkText("Sign Up")).isPresent()).toBe(true);
    });

    /**
     * The Log in Form
     */
    describe("> The \"Log In\" tab", () => {

      beforeEach(() => {
      });

      it("should be shown by default", () => {
        expect(AuthWizard.loginIcon.isDisplayed()).toBeTruthy();

        // Click Login
        AuthWizard.loginIcon.click();
        expect(AuthWizard.loginForm.waitReady()).toBeTruthy();

        const usernameLabel = element(by.css("label[for=\"username\"]"));
        expect(usernameLabel.waitReady()).toBeTruthy();
      });

      it("> should have a close button", () => {

        expect(AuthWizard.loginIcon.waitReady()).toBeTruthy();

        // Click Login
        AuthWizard.loginIcon.click();
        expect(AuthWizard.loginForm.waitReady()).toBeTruthy();
        expect(AuthWizard.loginCloseButton.isDisplayed).toBeTruthy();

        // Click close
        AuthWizard.loginCloseButton.click();
      });

      it("> should require a username and password", () => {

        expect(AuthWizard.loginIcon.waitReady()).toBeTruthy();

        // Click login
        AuthWizard.loginIcon.click();
        expect(AuthWizard.loginForm.waitReady()).toBeTruthy();

        // Click submit
        element(by.css(".login-auth-btn.btn.btn-md.btn-block")).click();

        // Expect error messages
        const usernameError = element(by.css("#error_id_username_1"));
        expect(usernameError.waitReady()).toBeTruthy();
        expect(usernameError.isDisplayed()).toBeTruthy();
        expect(element(by.css("#error_id_password_1")).isDisplayed()).toBeTruthy();

      });
    });

    /**
     * The Sign up Form
     */
    describe("> The \"Sign up\" tab", () => {
      beforeEach(() => {
      });

      it("> should register a new user", () => {
        expect(AuthWizard.loginIcon.isDisplayed()).toBeTruthy();
        // Click login
        AuthWizard.loginIcon.click();
        expect(AuthWizard.loginForm.waitReady()).toBeTruthy();

        // Click signup
        const button = element(by.linkText("Sign Up"));
        expect(button.waitReady()).toBeTruthy();
        button.click();
        const userid = `tester_${  AuthWizard.makeID(7)}`;
        const usernameInput = element(by.css("#id_username"));
        const nameInput = element(by.css("#id_first_name"));
        const lastNameInput = element(by.css("#id_last_name"));
        const emailInput = element(by.css("#id_email"));
        const passwordInput = element(by.css("#id_password"));
        const confirmPasswordInput = element(by.css("#password_confirm"));
        // Set username
        expect(usernameInput.waitReady()).toBeTruthy();
        usernameInput.sendKeys(userid);
        // Set First Name
        nameInput.sendKeys(AuthWizard.getUsername());
        // Set Last name
        lastNameInput.sendKeys(AuthWizard.getLastName());
        // Set email
        emailInput.sendKeys(AuthWizard.getEmail());
        // Set password
        passwordInput.sendKeys(AuthWizard.getPassword());
        // Confirm password
        confirmPasswordInput.sendKeys(AuthWizard.getPassword());
        // Accept terms
        const termsCheckbox = element(by.model("agreed"));
        termsCheckbox.click();
        // Click Join
        AuthWizard.signUpButton.click();
      });
    });

    xit("> should log in admin", () => {
      if (AuthWizard.userAvatar.isPresent() === true) {
        AuthWizard.logout();
      }
      expect(AuthWizard.loginIcon.waitReady()).toBeTruthy();
      AuthWizard.loginIcon.click();

      expect(AuthWizard.loginForm.isPresent()).toBe(true);
      browser.wait(EC.visibilityOf(AuthWizard.loginForm), 5000);
      expect(AuthWizard.loginForm.isDisplayed()).toBeTruthy();

      // Input username
      expect(AuthWizard.usernameInput.isPresent()).toBe(true);
      AuthWizard.usernameInput.sendKeys("admin");

      // Input password
      expect(AuthWizard.passwordInput.isPresent()).toBe(true);
      AuthWizard.passwordInput.sendKeys("admin");

      // Press the login button
      expect(AuthWizard.loginButton.isPresent()).toBe(true);
      AuthWizard.loginButton.click();

      // Should show the avatar after login
      browser.get(baseURL);
      expect(AuthWizard.userAvatar.waitReady()).toBeTruthy();
    });
  });
});
