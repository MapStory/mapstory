/**
 * Explore Page Object
 * ===================
 *
 * Describes the explore page for e2e testing
 */
'use strict';

require('../tools/waitReady.js');

let ExplorePageObject = function() {
	this.title = 'Explore - MapStory';
	this.content_search_tab = $('#content-search');
	this.storyteller_search_tab = $('#user-search');
	this.search_bar = $('#text_search_input');
	this.search_button = $('#text_search_btn');
	this.filter_all = element(by.linkText('All'));
	this.filter_mapstory = element(by.partialLinkText('MapStory'));
	this.filter_layer = element(by.partialLinkText('StoryLayer'));
	this.sort_popular = element(by.linkText('Popular'));
	this.sort_newest = element(by.linkText('Newest'));

	this.get = function() {
		browser.get('http://192.168.56.151/search');
		browser.waitForAngular();
	};
};

module.exports = new ExplorePageObject();
