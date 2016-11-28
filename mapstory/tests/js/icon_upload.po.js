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
};

module.exports = new iconUploadWizard();
