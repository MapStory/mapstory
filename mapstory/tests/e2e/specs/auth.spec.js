/**
 * User auth tests
 * ================
 */
const EC = protractor.ExpectedConditions;
require("../tools/waitReady.js");
const constants = require("../tools/constants");
const auth = require("../pages/auth.po");

describe('User auth', () => {
  beforeEach(() => {
    // Fetch Home
    browser.get(constants.baseURL);
    browser.waitForAngular();
  });

  /**
   * Login Button
   */
  it('Should display a Login Form', () => {
    auth.loginIcon.isDisplayed().then((displayed) => {
      if (displayed === false) {
        auth.logout();
      }

      expect(auth.loginIcon.waitReady()).toBeTruthy();
      auth.loginIcon.click();
      expect(auth.loginForm.waitReady()).toBeTruthy();
    });
  });

  /**
   * The Auth Form
   */
  it('should have "Log In" and "Sign up" tabs', () => {
    expect(auth.loginIcon.isDisplayed()).toBeTruthy();
    expect(auth.loginIcon.waitReady()).toBeTruthy();

    // Click login
    auth.loginIcon.click();
    expect(auth.loginModal.waitReady()).toBe(true);
    expect(element(by.linkText('Log In')).isPresent()).toBe(true);
    expect(element(by.linkText('Sign Up')).isPresent()).toBe(true);
  });

  /**
   * The Log in Form
   */

  it('should be shown by default', () => {
    expect(auth.loginIcon.isDisplayed()).toBeTruthy();

    // Click Login
    auth.loginIcon.click();
    expect(auth.loginForm.waitReady()).toBeTruthy();

    const usernameLabel = element(by.css('label[for="id_username"]'));
    expect(usernameLabel.waitReady()).toBeTruthy();
  });

  it('> should have a close button', () => {

    expect(auth.loginIcon.waitReady()).toBeTruthy();

    // Click Login
    auth.loginIcon.click();
    expect(auth.loginForm.waitReady()).toBeTruthy();
    expect(auth.login_close_button.isDisplayed).toBeTruthy();

    // Click close
    auth.login_close_button.click();
  });

  it('> should require a username and password for login', () => {

    expect(auth.loginIcon.waitReady()).toBeTruthy();

    // Click login
    auth.loginIcon.click();
    expect(auth.loginForm.waitReady()).toBeTruthy();

    // Click submit
    const submit = element(by.css('.login-auth-btn.btn.btn-md.btn-block'));
    submit.click();

    // TODO: Fix catching error message
    // Expect error messages
    // const errorDiv = element(by.css("#div_id_login"));
    // expect(errorDiv.waitReady()).toBeTruthy();
    // expect(element(errorDiv).getAttribute("class")).toContain("has-error");
  });

  /**
   * The Sign up Form
   */


  xit('> should register a new user', () => {
    expect(auth.loginIcon.isDisplayed()).toBeTruthy();
    // Click login
    auth.loginIcon.click();
    expect(auth.loginForm.waitReady()).toBeTruthy();
    browser.waitForAngular();
    browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
    // Click signup
    browser.driver.sleep(3000);
    const button = element(by.linkText('Sign Up'));
    // Remove fade effect
    expect(button.waitReady()).toBeTruthy();
    button.click();
    const userid = `tester_${auth.makeid(7)}`;
    const usernameInput = element(by.css('#id_username'));
    const nameInput = element(by.css('#id_first_name'));
    const lastNameInput = element(by.css('#id_last_name'));
    const emailInput = element(by.css('#id_email'));
    const passwordInput = element(by.css('#id_password'));
    const confirmPasswordInput = element(by.css('#password_confirm'));
    // Set username
    expect(usernameInput.waitReady()).toBeTruthy();
    usernameInput.sendKeys(userid);
    // Set First Name
    nameInput.sendKeys(auth.getUsername());
    // Set Last name
    lastNameInput.sendKeys(auth.getLastName());
    // Set email
    emailInput.sendKeys(auth.getEmail());
    // Set password
    passwordInput.sendKeys(auth.getPassword());
    // Confirm password
    confirmPasswordInput.sendKeys(auth.getPassword());
    // Accept terms
    const termsCheckbox = element(by.model('agreed'));
    termsCheckbox.click();
    // Click Join
    auth.signUpButton.click();
  });
});

xit('> should log in admin', () => {
  if (auth.userAvatar.isPresent() === true) {
    auth.logout();
  }
  expect(auth.loginIcon.waitReady()).toBeTruthy();
  auth.loginIcon.click();

  expect(auth.loginForm.isPresent()).toBe(true);
  browser.wait(EC.visibilityOf(auth.loginForm), 5000);
  expect(auth.loginForm.isDisplayed()).toBeTruthy();

  // Input username
  expect(auth.usernameInput.isPresent()).toBe(true);
  auth.usernameInput.sendKeys('admin');

  // Input password
  expect(auth.passwordInput.isPresent()).toBe(true);
  auth.passwordInput.sendKeys('admin');

  // Press the login button
  expect(auth.loginButton.isPresent()).toBe(true);
  auth.loginButton.click();

  // Should show the avatar after login
  browser.get(constants.baseURL);
  expect(auth.userAvatar.waitReady()).toBeTruthy();
});
