/**
 * Composer Page Object
 * ====================
 */
'use strict';

require('./waitReady.js');
var wait_times = require('./wait_times.js');

var composer = function() {
	this.startComposingLink = element(by.css('#start-composing'));
	this.welcome_modal = element(by.css('.modal-content'));
	this.go_back_home = element(by.linkText('Return to MapStory Home'));
	this.compose_story = element(by.linkText('Compose Story'));
	this.take_tour = element(by.linkText('Take a Tour'));
	this.tour_number = element(by.css('.hopscotch-bubble-number'));
	this.tour_next_button = element(by.css('.hopscotch-nav-button.next.hopscotch-next'));
	this.map_properties = element(by.css('#mapProperties'));
	this.map_properties_header = this.map_properties.element(by.css('.modal-header')).element(by.css('.modal-title.ng-scope.ng-binding'));

	this.get = function() {
		browser.ignoreSynchronization = true;
		browser.get('http://192.168.56.151/maps/new?tour');
		browser.sleep(wait_times['composer_tour_modal']);
	};
};

module.exports = new composer();
