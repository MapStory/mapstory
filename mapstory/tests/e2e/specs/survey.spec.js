
require("../tools/waitReady.js");

const auth = require("../pages/auth.po");
const waitTimes = require("../tools/wait_times");
const homePage = require("../pages/home.po").default;
const layerMetadata = require("../pages/layer_metadata.po");
const screenshotHelper = require("../tools/screenshot_helper");
const constants = require("../tools/constants");

/**
 * Tester object
 * @type {Object}
 */
const tester = {
  name: null,
  email: null,
  timestamp: null,
  browser: null,
  resolution: null
};

// Setup the screenshot on error feature
screenshotHelper.setup();

/**
 * Automated Survey tests
 *
 * These tests are mapped to the survey tests here: https://rey52.typeform.com/to/IpjcXD
 */
describe("[Survey Tests] |", () => {
  beforeEach(() => {
    // Fetch Home
    browser.get(constants.baseURL);
    browser.waitForAngular();
  });

  // Take a screenshot automatically after each failing test.
  afterEach(() => {
    // let passed = jasmine.getEnv().currentSpec.results().passed();
    // if (!passed) {
    //
    // }
  });

  describe("<<1>> Tester Info |", () => {
    const randomId = auth.makeID(7);

    describe("<a> Tester name", () => {
      it(": should set a test name", () => {
        tester.name = `tester_${  randomId}`;
        expect(tester.name).toBeTruthy("Tester name is expected");
      });
    });

    describe("<b> Your email |", () => {
      it("should set a test email", () => {
        tester.email = `test_${  randomId  }@testing.com`;
        expect(tester.email).toBeTruthy("Tester email is expected");
      });
    });

    describe("<c> Date of testing |", () => {
      it("should set testing timestamp", () => {
        tester.timestamp = Date.now();
        expect(tester.timestamp).toBeTruthy("Testing date is expected");
      });
    });

    describe("<d> Browser |", () => {
      it("> should set browser type", () => {
        // Get the browser name
        browser.getCapabilities().then((cap) => {
          const version = cap.get("version");
          const browserString = `${cap.get("browserName")  }_${  version}`;
          tester.browser = browserString;
          expect(tester.browser).toBeTruthy("Browser name is expected");
        });
      });

      it("> should set browser size", () => {
        tester.resolution = browser.driver.manage().window().getSize();
        expect(tester.resolution).toBeTruthy("Browser size is expected");
      });
    });
  });

  describe("<<2>> User Profile |", () => {
    describe("<a> Create an account |", () => {
      it("> should start by logging out", () => {
        homePage.logout();
        expect(auth.loginIcon.waitReady()).toBeTruthy("Failed to logout!");
      });

      it("> should create a new account", () => {
        expect(auth.loginIcon.isDisplayed()).toBeTruthy("Should log out first!");

        // Click login
        auth.loginIcon.click();
        browser.sleep(1000);

        const loginForm = element(by.css("form.form[action=\"/account/login/?next=/\"]"));
        expect(loginForm.waitReady()).toBeTruthy("Could not find Login Form");

        // Click signup
        const button = element(by.linkText("Sign Up"));
        expect(button.waitReady()).toBeTruthy("Could not find Sign up button");
        button.click();

        const modalWindow = element(by.css("#loginModal"));

        // Create a username
        const usernameInput = modalWindow.element(by.css("#id_username"));
        const nameInput = modalWindow.element(by.css("#id_first_name"));
        const lastNameInput = modalWindow.element(by.css("#id_last_name"));
        const emailInput = element(by.css("#id_email"));
        const passwordInput = element(by.css("#id_password"));
        const confirmPasswordInput = element(by.css("#password_confirm"));
        // Set username
        expect(usernameInput.waitReady()).toBeTruthy();
        usernameInput.sendKeys(tester.name);
        // Set First Name
        nameInput.sendKeys(tester.name);
        // Set Last name
        lastNameInput.sendKeys(auth.getLastName());
        // Set email
        emailInput.sendKeys(tester.email);
        // Set password
        passwordInput.sendKeys(auth.getPassword());
        // Confirm password
        confirmPasswordInput.sendKeys(auth.getPassword());
        // Accept terms
        const termsCheckbox = element(by.model("agreed"));
        termsCheckbox.click();
        // Click Join
        auth.signUpButton.click();
      });


      xit("> should login with new account", () => {
        const loginIcon = element(by.partialLinkText(tester.name));
        expect(loginIcon.waitReady()).toBeTruthy("Did not find login icon");
        loginIcon.click();

        expect(auth.loginForm.isPresent()).toBe(true, "Did not find login Form");
        expect(auth.loginForm.waitReady()).toBeTruthy("Did not find login Form");
        expect(auth.loginForm.isDisplayed()).toBeTruthy("Did not find login Form");

        // Input username
        expect(auth.usernameInput.isPresent()).toBe(true, "Did not find username input");
        auth.usernameInput.sendKeys(tester.name);

        // Input password
        expect(auth.passwordInput.isPresent()).toBe(true, "Did not find password input");
        auth.passwordInput.sendKeys(auth.getPassword());

        // Press the login button
        expect(auth.loginButton.isPresent()).toBe(true, "Did not find the login button");
        auth.loginButton.click();
      });
    });

    xdescribe("<b> Check your email |", () => {
      it("> should receive confirmation email", () => {

      });
    });

    xdescribe("<c> Confirm email |", () => {
      it("> should confirm email", () => {

      });
    });

    xdescribe("<d> Did receive Welcome email |", () => {
      it("> should receive welcome email", () => {

      });
    });

    describe("<e> Update profile info |", () => {
      it("> should update profile info", () => {
        // Click on your name

        const userIcon = $(".nav-avatar");
        expect(userIcon.waitReady()).toBeTruthy("Did not find the user icon");

        userIcon.click();

        const editProfileLink = element(by.partialLinkText("Edit Profile"));
        expect(editProfileLink.waitReady()).toBeTruthy();
        editProfileLink.click();

        const lastnameDiv = element(by.css("#div_id_last_name"));

        const lastNameInput = lastnameDiv.element(by.css("#id_last_name"));
        expect(lastNameInput.waitReady()).toBeTruthy();

        lastNameInput.sendKeys("t_123");

        const updateProfileButton = element(by.css("[value=\"Update profile\"]"));
        updateProfileButton.click();

        const userinfos = element(by.css(".user-info"));
        const usertitle = userinfos.all(by.css("h1"));
        usertitle.first().getText().then((text) => {
          expect(text.includes("t_123")).toBeTruthy();
        });
      });
    });

  });

  /**
   3. Uploading Datasets
   ======================
   * */
  describe("<<3>> Uploading Datasets |", () => {

    const testUpload = {
      filetype: "CSV",

    };

    /**
     a. Data format:
     - CSV
     - SHP
     - KML
     - JSON

     * */
    describe("<a> Set data format |", () => {
      it("> should use CSV", () => {
        expect(testUpload.filetype).toEqual("CSV");
      });

      xit("> should use SHP", () => {

      });

      xit("> should use KML", () => {

      });

      xit("> should use JSON", () => {

      });
    });

    /**

     b. Geometry:
     - Points
     - Lines
     - Polygons
     * */
    xdescribe("<b> Set Geometry type |", () => {


    });
    /**
     c. Timescale:
     - 4.5 Billion Years
     - 650 Million years
     - Present time
     * */
    xdescribe("<c> Set Timescale", () => {

    });
    /**
     d. Uploading:
     Were you able to upload succesfully?
     * */
    xdescribe("<d> Uploading", () => {
      beforeEach(() => {
        element(by.linkText("Create")).click();
        homePage.importLayerLink.click();
      });

      it("> has a \"Close button\"", () => {
        const closeButton = element(by.css("i.fa.fa-times.pointer.import-wizard-icon"));
        expect(closeButton.isDisplayed()).toBe(true);
        closeButton.click();
      });

      describe("> Step 1", () => {
        it("> should complete step 1", () => {
          homePage.uploadLayer_Step1();
        });

        xit("> can close the form", () => {

        });

        xit("> highlights the correct step", () => {

        });
      });

      describe("> Step 2", () => {
        it("should complete step 2", () => {
          homePage.uploadLayer_Step1();
          homePage.uploadLayer_Step2();
        });
      });

      describe("> Step 3", () => {
        it("> should complete step 3", () => {
          homePage.uploadLayer_Step1();
          homePage.uploadLayer_Step2();
          homePage.uploadLayer_Step3();
        });
      });

      describe("> Step 4", () => {
        it("should complete step 4", () => {
          homePage.uploadLayer_Step1();
          homePage.uploadLayer_Step2();
          homePage.uploadLayer_Step3();
          homePage.uploadLayer_Step4();
        });
      });

      describe("> Step 5", () => {
        it("> should complete step 5", () => {
          homePage.uploadLayer_Step1();
          homePage.uploadLayer_Step2();
          homePage.uploadLayer_Step3();
          homePage.uploadLayer_Step4();
          homePage.uploadLayer_Step5();
        });

      });

      describe("> Step 6", () => {
        it("> should complete step 6", () => {
          homePage.uploadLayer_Step1();
          homePage.uploadLayer_Step2();
          homePage.uploadLayer_Step3();
          homePage.uploadLayer_Step4();
          homePage.uploadLayer_Step5();
          homePage.uploadLayer_Step6();
        });
      });
    });

    /**
     e. Click 'Update Metadata' and add responses to questions. Does it display correctly?
     * */
    xdescribe("<e> Update Metadata", () => {
      beforeEach(() => {
        element(by.linkText("Create")).click();
        homePage.importLayerLink.click();
        homePage.uploadLayer_Step1();
        homePage.uploadLayer_Step2();
        homePage.uploadLayer_Step3();
        homePage.uploadLayer_Step4();
        homePage.uploadLayer_Step5();
      });

      it("> Can edit metadata", () => {
        homePage.uploadLayer_Step6();
        browser.sleep(waitTimes.metadataLoad);
        expect(layerMetadata.titleInput.waitReady()).toBeTruthy();
        expect(layerMetadata.categoryDropdown.waitReady()).toBeTruthy();
        expect(layerMetadata.summaryText.waitReady()).toBeTruthy();
        expect(layerMetadata.languageDropdown.waitReady()).toBeTruthy();
        expect(layerMetadata.dataSourceText.waitReady()).toBeTruthy();
        expect(layerMetadata.dataQualityText.waitReady()).toBeTruthy();
        expect(layerMetadata.purposeText.waitReady()).toBeTruthy();
        expect(layerMetadata.isPublishedCheckbox.waitReady()).toBeTruthy();


        // Save
        layerMetadata.saveButton.click();
      });
    });


    /**
     f. Click update layer settings again and make sure that "Is published" is checked and save. Go to explore and find your update layer. Did you find it?
     * */
    xdescribe("<f> Set is published", () => {
      beforeEach(() => {
        element(by.linkText("Create")).click();
        homePage.importLayerLink.click();
        homePage.uploadLayer_Step1();
        homePage.uploadLayer_Step2();
        homePage.uploadLayer_Step3();
        homePage.uploadLayer_Step4();
        homePage.uploadLayer_Step5();
      });

      it("should set published checkbox", () => {
        homePage.uploadLayer_Step6();
        browser.sleep(waitTimes.metadataLoad);

        expect(layerMetadata.isPublishedCheckbox.waitReady()).toBeTruthy();
        layerMetadata.isPublishedCheckbox.click();

        // Save
        layerMetadata.saveButton.click();
      });

    });


    /**
     g. Click Download. Try to download the filetypes . No errors?
     * */
    xdescribe("<g> Download filetypes", () => {
      beforeEach(() => {
        element(by.linkText("Create")).click();
        homePage.importLayerLink.click();
        homePage.uploadLayer_Step1();
        homePage.uploadLayer_Step2();
        homePage.uploadLayer_Step3();
        homePage.uploadLayer_Step4();
        homePage.uploadLayer_Step5();
        homePage.uploadLayer_Step6();

        browser.sleep(waitTimes.metadataLoad);

        // Mark as published
        expect(layerMetadata.isPublishedCheckbox.waitReady()).toBeTruthy();
        layerMetadata.isPublishedCheckbox.click();

        // Save
        layerMetadata.saveButton.click();

        browser.sleep(1000);
      });

      it("should download CSV", () => {
        browser.sleep(2000);
        const downloadLink = element(by.linkText("Download"));
        expect(downloadLink.waitReady()).toBeTruthy();

        downloadLink.click();
        browser.sleep(1000);

        const CSVlink = element(by.linkText("CSV"));
        expect(CSVlink.waitReady()).toBeTruthy();

        CSVlink.click();
      });
    });
    /**
     h. Add tags to storylayer. Go to explore page and search for your storylayer using these tags.
     * */
    describe("<h> Add Tags to storylayer", () => {

    });
    /**
     i. Go to comments tab and leave a comment. Success?
     * */
    describe("<i> Comments section", () => {

    });
    /**
     j. Click "Mark as favorite" . The link should toggle. Check the favorites tab in your profile. Does it display under favorites?
     */
    describe("<j> Mark as favorite", () => {

    });
  });

  describe("<< 4 >> Editing StoryLayer Features -", () => {

    /**
     4. Editing StoryLayer Features
     ===============================

     a. Go to the storylayer detail page. Click "edit this story layer" button. Does the layer appear on the map display? Complete with time and info?
     * */
    describe("<a> Edit Story layer", () => {

    });
    /**
     b. Click "Add Feature" and create new feature geometry and add attrib values. Were you able to add new features without encountering errors?
     * */
    describe("<b> Add Feature geometry", () => {

    });
    /**
     c. Click "Edit Feature" and update the geometry a random feature. Did it update?
     * */
    describe("<c> Edit and update geometry", () => {

    });
    /**
     d. Click "Edit feature" and update the attribute values of a reandom feature. Did it update?
     * */
    describe("<d> Update attribute values", () => {

    });
    /**
     e. Click on a feature and try to remove a feature. Where you able to delete an existing feature from storylayer?
     * */
    describe("<e> Remove a feature", () => {

    });
    /**
     f. Do the edits from step 5.2 to step 5.3 appear in the history log (4 edits total)? Does the name/username appear on it?
     * */
    describe("<f> History logs", () => {

    });
    /**
     g. Undo the deletion you made in Step 5.5 Check if theres a new green history log in view history. Were you able to revert back?
     */
    describe("<g> Undo deletion", () => {

    });

  });

  describe("<< 5 >> Managing Chapters -", () => {
    /**
     5. Managing Chapters
     ====================

     a. Launch the Composer. Start composing by choosing "Compose Mapstory". After provinding basic info about mapstory, did "Save Sucesful" appear?
     * */
    describe("<a>", () => {

    });
    /**
     b. Update the chapter information of chapter 1. Were you able to save without errors?
     * */
    describe("<b>", () => {

    });
    /**
     c. Create a new chapter and update its chapter info. Were you able to do this step without encountering any error messages?
     * */
    describe("<c>", () => {

    });
    /**
     d. Go back to the chapter info of the first chapter. Are the contests in step 7.2 still displayed?
     * */
    describe("<d>", () => {

    });
    /**
     e. Let's delete Chapter 2. Did it delete withour error?
     */
    describe("<e>", () => {

    });

  });

  describe("<< 6 >> Adding StoryLayers -", () => {
    /**
     6. Adding StoryLayers
     =====================

     a. Load the "add a storylayer" wizard, perform a quick search of any random storylayer. Click view storylayer. Did it load in a new tab that displays ok?
     * */
    describe("<a>", () => {

    });
    /**
     b. 8.2 Load the "add a storylayer" window. Perform a quick search and then click "Use". Did the story load on composer OK? Example keyworkds: "USA, Africa, street, river"
     * */
    describe("<b>", () => {

    });
    /**
     c. Add the layer you uploaded earlier as a storylayer to your mapstory. Did it find it in the epxlore storylayers pop-up window under the My storylayers tab?
     * */
    describe("<c>", () => {

    });
    /**
     d. Click Use storylayer. Did it load on composer?
     * */
    describe("<d>", () => {

    });
    /**
     e. Does the timeline below the map display OK?
     * */
    describe("<e>", () => {

    });
    /**
     f. Click play. Do all of the features on the map appear as that you expect?
     * */
    describe("<f>", () => {

    });
    /**
     g. Click on the layer's title on the sidebar. Click 'Masking' button. Change the "Layer Alias" ckick and hit save settings. Does the lengend display the updated title?
     * */
    describe("<g>", () => {

    });
    /**
     h. Rename the attributes of you storylayer on the "Masking" panel. Click on a feature on the map. Does the infobox display the updated attribute names you just set?
     * */
    describe("<h>", () => {

    });
    /**
     i. Exit Masking and test the layer reordering by dragging the layers up and down the list. Does the reordering reflect on the map display?
     * */
    describe("<i>", () => {

    });
    /**
     j. Remove a storylayer from a chapter. Were you able to remove the storylayer you added in step 2 withour errors?
     */
    describe("<j>", () => {

    });

  });

  describe("<< 7 >> Appending data -", () => {
    /**
     7. Appending data
     =================

     a. How many data records (rows) would you like to append? NUM
     b Download the CSV schema. Update the file using the data you have. Now upload it. Were you able to append your data?
     c. Download the SHP shchema. Update the file, upload .

     >> "Are your features added to the StoryLayer?" And
     >> "Are your edits appearing in the Edit History?"

     1) From the MapStory drop down, click "Create StoryLayer".
     2) Give your StoryLayer a name and define the geometry type you want to use
     3) Add an attribute (i.e. add a text attribute for "Name")
     4) Indicate which of your attributes is for time
     5) Set your StoryLayer to be open for editing
     7) Create your StoryLayer

     Questions :
     1) are you taken to a StoryLayer page with your StoryLayer title and an empty map?
     Now, click "Edit StoryLayer".
     Try adding a feature to this StoryLayer and save.
     Does your new feature show up on the StoryLayer playback?
     Does it show up in the Edit History?
     */

    describe("How many data records?", () => {

    });
  });
});
