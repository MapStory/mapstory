const auth = require('../pages/auth.po');
const home = require('../pages/home.po');
const composer = require('../pages/composer.po');
let path = require('path');
// const protractor = require('protractor');
const EC = protractor.ExpectedConditions;
// const ptor = protractor.getInstance();


describe('Composer Survey', () => {

	it('should be logged in', () => {
		home.get();
		auth.login('admin', 'admin');
	});

	it('should have a layer ready for testing', () => {
		// TODO: Import a layer here

	}).pend('TODO');

	it('should open composer', () => {
		home.get();
		// expect(page.navBar.isDisplayed()).toBe(true);
		home.menuCreate.click();

		// The links inside the dropdown
		expect(home.composeStoryLink.waitReady()).toBe(true);
		// Click on 'Compose Story' inside the dropdown menu
		home.composeStoryLink.click();
	});

	describe('1. Launching the composer', () => {
		describe('(a) Launch the composer and provide basic information about your new story', () => {


			it('should edit the story title and summary', () => {
				// Click on 'Edit Story Info'
				// Change the 'Title'
				// Change the 'Summary'
				// Click 'Save'
			}).pend('TODO');

			it('should show \'Save Successful\' message', () => {

			}).pend('TODO');

			it('should reflect the changes on the title', () => {

			}).pend('TODO');
		});
	});

	describe('2. Creating, updating and managing chapters', () => {
		describe('(b) Update the chapter information of Chapter 1', () => {
			it('should edit a chapter title and summary', () => {
				// Click on Chapter 1 'detail' arrow.
				// Change 'Chapter Title'
				// Change 'Chapter Summary'
				// Click 'Save'

			}).pend('TODO');
		});

		describe('(c) Create a new chapter and update its chapter info', () => {
			it('should create a new chapter', () => {
				// Click on 'Table of Contents'
				composer.table_of_contents_button.click();

				// Click 'Add New Chapter' button
				expect(composer.new_chapter_button.waitReady()).toBe(true);
				expect(composer.chapter_binds.count()).toBe(3);
				composer.new_chapter_button.click();
				expect(composer.chapter_binds.count()).toBe(6);
			});

			it('should edit the newly created chapter', () => {
				// Click on Chapter 2 'detail' arrow.
				// Change 'Chapter Title'
				// Change 'Chapter Summary'
				// Click 'Save'
			}).pend('TODO');
		});

		describe('(d) Check the first chapter again.', () => {
			it('should keep the information from chapter 1', () => {
				// Click on Table of contents
				// Check for Chapter 1 info

			}).pend('TODO');
		});

		describe('(e) Delete Chapter 2', () => {
			it('should remove Chapter 2', () => {
			}).pend('TODO');
		});
	});

	describe('3. Adding and searching for storylayers', () => {
		describe('(a) Add a random storylayer by using keyword search.', () => {
			// Click on Layer icon
			// Click 'Add a StoryLayer'
			// Type a layer name 'prisions'

		}).pend('TODO');
		describe('(b) Add the storylayer you imported/created earlier.', () => {
			// Click 'Add a StoryLayer'
			// Search for the test layer we prepared
			// Add the layer

		}).pend('TODO');
		describe('(c) Click Play.', () => {
			// Click play

		}).pend('TODO');
	});

	describe('4. Styling and masking storylayers', () => {
		describe('(a) Rename the storylayer title using Masking.', () => {
		}).pend('TODO');
		describe('(b) Remove the first storylayer you added from your mapstory.', () => {
			it('should remove the first layer', () => {

			}).pend('TODO');
		});

		describe('(a) What type of features does the storylayer have?', () => {

		}).pend('TODO');
		describe('(b) Change the appearance of your features using Simple style', () => {
			// Click on storylayer
			// Click on symbol style
			// Click 'back'
		}).pend('TODO');
		describe('(c) Change the appearance of your features using Unique style', () => {

		}).pend('TODO');
		describe('(d) Change the appearance of your features using Choropleth style.', () => {

		}).pend('TODO');
		describe('(e) Change the appearance of your features using Graduated style', () => {

		}).pend('TODO');
		describe('(f) Check style persistence by exiting Style Editor and getting back in.', () => {
			// It should persist style changes if reloaded.
		}).pend('TODO');
		describe('(g) Do you have SVG icons?', () => {

		}).pend('TODO');
	});

	describe('5. Creating and updating storyboxes', () => {
		describe('(a) Create a new storybox. Provide a title, description, map bounds, start and end times.', () => {
		}).pend('TODO');

		describe('(b) Create a new storybox. Make sure that the time frames of your storyboxes don\'t overlap.', () => {

		}).pend('TODO');

		describe('(c) Click Play. Make sure you start the playback at StoryBox 1.', () => {

		}).pend('TODO');

		describe('(d) Delete the second storybox.', () => {

		}).pend('TODO');
	});

	describe('6. Creating, updating and bulk uploading storypins', () => {
		it('should open storypins sidebar', () => {
			expect(composer.storypins_button.waitReady()).toBe(true);
			composer.storypins_button.click();
		});

		describe('(a) Create a new storypin.', () => {
			it('creates a new pin', () => {
				expect(composer.add_storypin_button.waitReady()).toBe(true);
				composer.add_storypin_button.click();
				expect(composer.storypin_binds.count()).toBe(2);
			});

			// The Pin
			const pin0 = $('#pin-overlay-0');
			const pinForm0 = $('#pin-form-0');

			it('should show the storypin overlay by default', () => {
				expect(pin0.isDisplayed()).toBeTruthy();
			});

			it('should change the title and content of the storypin', () => {
				expect(pin0.$('.heading').getText()).toBe('A StoryPin');

				// Change the title
				pinForm0.$('#storypin_title').clear().sendKeys('The first storypin');

				// Add content text
				pinForm0.$('#storypin_text').clear().sendKeys('The first storypin content');

				// Click save
				pinForm0.$('#storpin-save-button').click();

				// The title should now change.
				expect(pin0.$('.heading').getText()).toBe('The first storypin');
			});

			it('should embed a youtube video', () => {
				const videoEmbededUrl = 'https://www.youtube.com/embed/ferZnZ0_rSM';
				pinForm0.$('#storypin_media').clear().sendKeys(videoEmbededUrl);

				// Click save
				pinForm0.$('#storpin-save-button').click();

				pin0.$('iframe').getAttribute('src').then( value => {
					expect(value).toEqual('https://www.youtube.com/embed/ferZnZ0_rSM');
				});
			});

			it('should reject embedding non-whitelisted urls', () => {
				const videoEmbededUrl = 'https://josellausas.com/';
				pinForm0.$('#storypin_media').clear().sendKeys(videoEmbededUrl);

				// Click save
				pinForm0.$('#storpin-save-button').click();

				pin0.$('iframe').getAttribute('src').then( value => {
					expect(value).toContain('static/composer/');
				});
			});

			it('should create pins for chapter 2', () => {
				// Go to next chapter
				const next_chapter_arrow = $('[ng-click="nextChapter()"]');
				next_chapter_arrow.click();

				// Create new pin
				expect(composer.add_storypin_button.waitReady()).toBe(true);
				composer.add_storypin_button.click();
				expect(composer.storypin_binds.count()).toBe(2);

				// Should have created a new pin.
				expect(pin0.$('.heading').getText()).toBe('A StoryPin');

				// Go back to chatper 1 and check for other pin.
				const prev_chapter_arrow = $('[ng-click="previousChapter()"]');
				prev_chapter_arrow.click();

				// Should see the first storypin we created.
				expect(pin0.$('.heading').getText()).toBe('The first storypin');
			});

			it('should save and keep changes', () => {
				// Click the save button
				composer.save_story_button.click();

				// Wait for page reload
				browser.wait(EC.urlContains('draft'), 10000);

				// Check that storypins are still there
				expect(composer.storypins.length).toEqual(1);
			});
		});


		describe('(b) Upload multiple storypins using Bulk Upload. After upload, click Play.', () => {
			it('should create new storypins from a CSV upload', () => {
				composer.bulk_upload_button.click();
				expect(composer.upload_modal.waitReady()).toBeTruthy();
				// composer.csv_button.click();
				const input = composer.upload_modal.$('#bulk_pin_csv_file');
				expect(input.waitReady()).toBeTruthy();
				input.sendKeys(path.resolve(__dirname, '../../sampledata/storypins.csv'));
				composer.upload_modal.$('#ok-btn-modal-bulk').click();
			});
		}).pend('Fix this');


		describe('(c) Delete a storypin.', () => {
		}).pend('TODO');
	});

	describe('7. Saving and Publishing stories', () => {
		describe('(a) Publish your mapstory.', () => {
			it('should display a \'success\' message', () => {

			}).pend('TODO');
		});

		describe('(b) URL of the published mapstory.', () => {

		}).pend('TODO');

		describe('(c) Watch your published mapstory in fullscreen.', () => {
			it('chapter information', () => {

			}).pend('TODO');
			it('chapter basemap', () => {

			}).pend('TODO');
			it('chapter zoom level', () => {

			}).pend('TODO');
			it('storylayer features', () => {

			}).pend('TODO');
			it('storylayer styles', () => {

			}).pend('TODO');
			it('storybox zoom levels', () => {

			}).pend('TODO');
			it('storybox transition', () => {

			}).pend('TODO');
			it('storypin content & embed', () => {

			}).pend('TODO');
			it('storypin appearance/dissapearence', () => {

			}).pend('TODO');
			it('timeline items', () => {

			}).pend('TODO');
			it('legend entries', () => {

			}).pend('TODO');
		});

		describe('(d) Hit the Loop button to loop your Chapter. Hit the Loop button twice to Loop the MapStory across chapters. Select the options below that worked.', () => {

		}).pend('TODO');

		describe('(e) Find your published mapstory in Explore page.', () => {

		}).pend('TODO');

		describe('(f) Find your published story in your profile page.', () => {

		}).pend('TODO');

		describe('(g) Play your MapStory. As a viewer can you do the following?', () => {
			it('should pause story and start playing again', () => {

			}).pend('TODO');
			it('should click and play any videos that appear in StoryPins', () => {

			}).pend('TODO');
			it('should click on features and view attribute information', () => {

			}).pend('TODO');
			it('should click on features and view attribute information', () => {

			}).pend('TODO');
			it('should embed your story on another site', () => {

			}).pend('TODO');
			it('should share your story with a link', () => {

			}).pend('TODO');
			it('should comment on your story', () => {

			}).pend('TODO');
			it('should flag your story if something is wrong with it', () => {

			}).pend('TODO');
			it('should rate your story on a 5 point scale', () => {

			}).pend('TODO');
		});

		describe('(h) Make some changes in your published story and republish it.', () => {

		}).pend('TODO');
	});
});