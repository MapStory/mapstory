'use strict';

require('../tools/waitReady.js');

let images_page = function() {
	this.navbar = element(By.css('.navigation'));
	this.loginModal = element(By.id('loginModal'));
};

module.exports = new images_page();
