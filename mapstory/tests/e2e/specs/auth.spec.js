

/**
 * User auth tests
 * ================
 */

import "../tools/waitReady";
import { baseURL } from "../tools/constants";
import { loginIcon, logout, loginForm, loginModal, loginCloseButton, makeID, getUsername, getLastName, getEmail, getPassword, signUpButton, userAvatar, usernameInput as _usernameInput, passwordInput as _passwordInput, loginButton } from "../pages/auth.po";

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

    loginIcon.isDisplayed().then((displayed) => {

      if (displayed === false) {
        logout();
      }

      expect(loginIcon.waitReady()).toBeTruthy();

      loginIcon.click();
      expect(loginForm.waitReady()).toBeTruthy();

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
      expect(loginIcon.isDisplayed()).toBeTruthy();
      expect(loginIcon.waitReady()).toBeTruthy();

      // Click login
      loginIcon.click();
      expect(loginModal.waitReady()).toBe(true);
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
        expect(loginIcon.isDisplayed()).toBeTruthy();

        // Click Login
        loginIcon.click();
        expect(loginForm.waitReady()).toBeTruthy();

        const usernameLabel = element(by.css("label[for=\"username\"]"));
        expect(usernameLabel.waitReady()).toBeTruthy();
      });

      it("> should have a close button", () => {

        expect(loginIcon.waitReady()).toBeTruthy();

        // Click Login
        loginIcon.click();
        expect(loginForm.waitReady()).toBeTruthy();
        expect(loginCloseButton.isDisplayed).toBeTruthy();

        // Click close
        loginCloseButton.click();
      });

      it("> should require a username and password", () => {

        expect(loginIcon.waitReady()).toBeTruthy();

        // Click login
        loginIcon.click();
        expect(loginForm.waitReady()).toBeTruthy();

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
        expect(loginIcon.isDisplayed()).toBeTruthy();
        // Click login
        loginIcon.click();
        expect(loginForm.waitReady()).toBeTruthy();

        // Click signup
        const button = element(by.linkText("Sign Up"));
        expect(button.waitReady()).toBeTruthy();
        button.click();
        const userid = `tester_${  makeID(7)}`;
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
        nameInput.sendKeys(getUsername());
        // Set Last name
        lastNameInput.sendKeys(getLastName());
        // Set email
        emailInput.sendKeys(getEmail());
        // Set password
        passwordInput.sendKeys(getPassword());
        // Confirm password
        confirmPasswordInput.sendKeys(getPassword());
        // Accept terms
        const termsCheckbox = element(by.model("agreed"));
        termsCheckbox.click();
        // Click Join
        signUpButton.click();
      });
    });

    xit("> should log in admin", () => {
      if (userAvatar.isPresent() === true) {
        logout();
      }
      expect(loginIcon.waitReady()).toBeTruthy();
      loginIcon.click();

      expect(loginForm.isPresent()).toBe(true);
      browser.wait(EC.visibilityOf(loginForm), 5000);
      expect(loginForm.isDisplayed()).toBeTruthy();

      // Input username
      expect(_usernameInput.isPresent()).toBe(true);
      _usernameInput.sendKeys("admin");

      // Input password
      expect(_passwordInput.isPresent()).toBe(true);
      _passwordInput.sendKeys("admin");

      // Press the login button
      expect(loginButton.isPresent()).toBe(true);
      loginButton.click();

      // Should show the avatar after login
      browser.get(baseURL);
      expect(userAvatar.waitReady()).toBeTruthy();
    });
  });
});
