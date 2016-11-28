/**
 * Login Wizard Page Object
 * =========================
 */

'use strict';

var LoginWizard = function() {
	this.getUsername = function() {
		return 'admin';
	};

	this.getPassword = function() {
		return 'admin';
	};
};

module.exports = new LoginWizard();
