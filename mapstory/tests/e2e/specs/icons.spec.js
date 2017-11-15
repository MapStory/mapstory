/**
 * Composer E2E Tests
 * ==================
 */
'use strict';

require('../tools/waitReady.js');
let gif_upload = require('../pages/gif_upload.po');
let composer = require('../pages/composer.po');
let make_new_id = require('../tools/make_id');

describe('Composer', function() {
	// Our home page object
	beforeEach(function() {
		// Fetch Home
		browser.ignoreSynchronization = true;
	});

	xit('should upload a gif as a thumbnail', () => {
	   gif_upload.get();

        // Click compose story
        expect(composer.compose_story.waitReady()).toBeTruthy();
        composer.compose_story.click();

        // Setup the story properties
        expect(composer.map_properties_title_text.waitReady()).toBeTruthy();
        composer.map_properties_title_text.sendKeys('Testing Title' + make_new_id(5));
        composer.map_properties_summary_text.sendKeys('Some test summary here');

        // Click save
        composer.map_properties_save_button.click();

        expect(composer.publish_link.waitReady()).toBeTruthy();
        composer.publish_link.click();


    });

/*
	it('should fail here :)', () => {
	   expect(true).toBe(false);
    });
*/
});

