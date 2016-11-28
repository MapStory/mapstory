/**
 * Icon Upload Wizard Page Object
 * ==============================
 */
'use strict';

require('./waitReady.js');
var path = require('path');

const testPNGRelative = '../test_assets/icon.png';
const testPNGFile = path.resolve(__dirname, testPNGRelative);

const testSVGRelative = '../test_assets/icon-github.svg';
const testSVGFile = path.resolve(__dirname, testSVGRelative);

var iconUploadWizard = function() {
	this.getPNGPath = function() {
		return testPNGFile;
	};

	this.getSVGPath = function() {
		return testSVGFile;
	};

	this.getSuccessText = function() {
		return 'Congratulations! Your upload was successful. You can see your icons on your profile page. When you\'re composing a story with point layers, you\'ll be able to style your points with any icons uploaded by any storyteller in the Icons Commons!';
	};
};

module.exports = new iconUploadWizard();
