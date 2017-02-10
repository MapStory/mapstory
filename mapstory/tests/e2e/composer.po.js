/**
 * Composer Page Object
 * ====================
 */
'use strict';

require('./waitReady.js');
var wait_times = require('./wait_times.js');

/**
 * Composer Page Object
 */
var composer = function() {
	/**
	 * Composer Page Elements
	 */
	this.startComposingLink = $('#start-composing');
	this.welcome_modal = $('.modal-content');
	this.go_back_home = element(by.linkText('Return to MapStory Home'));
	this.compose_story = element(by.linkText('Compose Story'));
	this.take_tour = element(by.linkText('Take a Tour'));
	this.tour_number = $('.hopscotch-bubble-number');
	this.tour_next_button = $('.hopscotch-nav-button.next.hopscotch-next');
	this.map_properties = $('#mapProperties');
	this.map_properties_header = this.map_properties.element(by.css('.modal-header')).element(by.css('.modal-title.ng-scope.ng-binding'));
	this.map_properties_title_text = this.map_properties.element(by.css('#mapTitle'));
	this.map_properties_summary_text = this.map_properties.element(by.css('#mapAbstract'));
	this.map_properties_category_dropdown = this.map_properties.element(by.css('#id_category'));
	this.map_properties_tags_text = this.map_properties.element(by.css('#mapKeywords'));
	this.map_properties_location_dropdown = this.map_properties.element(by.css('#mapRegions'));
	this.map_properties_save_button = this.map_properties.element(by.buttonText('Save'));
	this.story_title = element(by.css('#mapstory-title'));
	this.story_chapter_01_div = element(by.css('.menuItem.ng-scope'));
	this.story_chapter_01_link = this.story_chapter_01_div.element(by.css('a'));

	/**
	 * Gets the Composer page
	 */
	this.get = function() {
		browser.ignoreSynchronization = true;
		browser.get('http://192.168.56.151/maps/new?tour');
		browser.sleep(wait_times['composer_tour_modal']);
	};

	/**
	 * Generates a random story title
	 * @param  {uint} length Length of random ID (Defaults to 5)
	 * @return {String}        A random story title
	 */
	this.makeRandomTitle = function(length) {
		var text = '';
		var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		// Default to 5
		if (length < 1 ){
			length = 5;
		}

		for( var i=0; i < length; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return 'test_story_' + text;
	};

};

module.exports = new composer();
