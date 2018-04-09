const auth = require('../pages/auth.po');
const home = require('../pages/home.po');

describe("Composer Survey https://rey52.typeform.com/to/U2GlO3", () => {

  it("should be logged in", () => {
    home.get();
    auth.login('admin', 'admin');
  });

  it("should have a layer ready for testing", () => {
    // TODO: Import a layer here

  }).pend("TODO");

  describe("1. Launching the composer", () => {
    describe("(a) Launch the composer and provide basic information about your new story", () => {
      it("should open composer", () => {
        // Open Home page
        // Click on 'Create'
        // Click on 'Compose Story' inside the dropdown menu

      }).pend("TODO");

      it("should edit the story title and summary", () => {
        // Click on 'Edit Story Info'
        // Change the 'Title'
        // Change the 'Summary'
        // Click 'Save'
      }).pend("TODO");

      it("should show 'Save Successful' message", () => {

      }).pend("TODO");

      it("should reflect the changes on the title", () => {

      }).pend("TODO");
    });
  });

  describe("2. Creating, updating and managing chapters", () => {
    describe("(b) Update the chapter information of Chapter 1", () => {
      it("should edit a chapter title and summary", () => {
        // Click on Chapter 1 'detail' arrow.
        // Change 'Chapter Title'
        // Change 'Chapter Summary'
        // Click 'Save'

      }).pend("TODO");
    });

    describe("(c) Create a new chapter and update its chapter info", () => {
      it("should create a new chapter", () => {
        // Click on 'Table of Contents'
        // Click 'Add New Chapter' button

      }).pend("TODO");

      it("should edit the newly created chapter", () => {
        // Click on Chapter 2 'detail' arrow.
        // Change 'Chapter Title'
        // Change 'Chapter Summary'
        // Click 'Save'
      }).pend("TODO");
    });

    describe("(d) Check the first chapter again.", () => {
      it("should keep the information from chapter 1", () => {
        // Click on Table of contents
        // Check for Chapter 1 info

      }).pend("TODO");
    });

    describe("(e) Delete Chapter 2", () => {
      it("should remove Chapter 2", () => {
      }).pend("TODO");
    });
  });

  describe("3. Adding and searching for storylayers", () => {
    describe("(a) Add a random storylayer by using keyword search.", () => {
      // Click on Layer icon
      // Click 'Add a StoryLayer'
      // Type a layer name 'prisions'

    }).pend("TODO");
    describe("(b) Add the storylayer you imported/created earlier.", () => {
      // Click 'Add a StoryLayer'
      // Search for the test layer we prepared
      // Add the layer

    }).pend("TODO");
    describe("(c) Click Play.", () => {
      // Click play

    }).pend("TODO");
  });

  describe("4. Styling and masking storylayers", () => {
    describe("(a) Rename the storylayer title using Masking.", () => {
    }).pend("TODO");
    describe("(b) Remove the first storylayer you added from your mapstory.", () => {
      it("should remove the first layer", () => {

      }).pend("TODO");
    });

    describe("(a) What type of features does the storylayer have?", () => {

    }).pend("TODO");
    describe("(b) Change the appearance of your features using Simple style", () => {
      // Click on storylayer
      // Click on symbol style
      // Click 'back'
    }).pend("TODO");
    describe("(c) Change the appearance of your features using Unique style", () => {

    }).pend("TODO");
    describe("(d) Change the appearance of your features using Choropleth style.", () => {

    }).pend("TODO");
    describe("(e) Change the appearance of your features using Graduated style", () => {

    }).pend("TODO");
    describe("(f) Check style persistence by exiting Style Editor and getting back in.", () => {
      // It should persist style changes if reloaded.
    }).pend("TODO");
    describe("(g) Do you have SVG icons?", () => {

    }).pend("TODO");
  });

  describe("5. Creating and updating storyboxes", () => {
    describe("(a) Create a new storybox. Provide a title, description, map bounds, start and end times.", () => {
    }).pend("TODO");

    describe("(b) Create a new storybox. Make sure that the time frames of your storyboxes don't overlap.", () => {

    }).pend("TODO");

    describe("(c) Click Play. Make sure you start the playback at StoryBox 1.", () => {

    }).pend("TODO");

    describe("(d) Delete the second storybox.", () => {

    }).pend("TODO");
  });

  describe("6. Creating, updating and bulk uploading storypins", () => {
    describe("(a) Create a new storypin." +
      " Provide a title, summary, media embed, pin location and time extents. " +
      "Tick all the checkboxes.", () => {
    }).pend("TODO");
    describe("(b) Upload multiple storypins using Bulk Upload. After upload, click Play.", () => {
    }).pend("TODO");
    describe("(c) Delete a storypin.", () => {
    }).pend("TODO");
  });

  describe("7. Saving and Publishing stories", () => {
    describe("(a) Publish your mapstory.", () => {
      it("should display a 'success' message", () => {

      }).pend("TODO");
    });

    describe("(b) URL of the published mapstory.", () => {

    }).pend("TODO");

    describe("(c) Watch your published mapstory in fullscreen.", () => {
      it("chapter information", () => {

      }).pend("TODO");
      it("chapter basemap", () => {

      }).pend("TODO");
      it("chapter zoom level", () => {

      }).pend("TODO");
      it("storylayer features", () => {

      }).pend("TODO");
      it("storylayer styles", () => {

      }).pend("TODO");
      it("storybox zoom levels", () => {

      }).pend("TODO");
      it("storybox transition", () => {

      }).pend("TODO");
      it("storypin content & embed", () => {

      }).pend("TODO");
      it("storypin appearance/dissapearence", () => {

      }).pend("TODO");
      it("timeline items", () => {

      }).pend("TODO");
      it("legend entries", () => {

      }).pend("TODO");
    });

    describe("(d) Hit the Loop button to loop your Chapter. Hit the Loop button twice to Loop the MapStory across chapters. Select the options below that worked.", () => {

    }).pend("TODO");

    describe("(e) Find your published mapstory in Explore page.", () => {

    }).pend("TODO");

    describe("(f) Find your published story in your profile page.", () => {

    }).pend("TODO");

    describe("(g) Play your MapStory. As a viewer can you do the following?", () => {
      it("should pause story and start playing again", () => {

      }).pend("TODO");
      it("should click and play any videos that appear in StoryPins", () => {

      }).pend("TODO");
      it("should click on features and view attribute information", () => {

      }).pend("TODO");
      it("should click on features and view attribute information", () => {

      }).pend("TODO");
      it("should embed your story on another site", () => {

      }).pend("TODO");
      it("should share your story with a link", () => {

      }).pend("TODO");
      it("should comment on your story", () => {

      }).pend("TODO");
      it("should flag your story if something is wrong with it", () => {

      }).pend("TODO");
      it("should rate your story on a 5 point scale", () => {

      }).pend("TODO");
    });

    describe("(h) Make some changes in your published story and republish it.", () => {

    }).pend("TODO");
  });
});