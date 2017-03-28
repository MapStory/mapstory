/**
 * Layer Metadata Wizard Page Object
 * ===============================
 */
'use strict';

require('../tools/waitReady.js');

let layer_metadata_wizard = function() {
	this.titleInput = element(by.css('#id_title'));
	this.categoryDropdown = element(by.css('#id_category'));
	this.summaryText = element(by.css('#id_abstract'));
	this.languageDropdown = element(by.css('#id_language'));
	this.dataSourceText = element(by.css('#id_distribution_url'));
	this.dataQualityText = element(by.css('#id_data_quality_statement'));
	this.purposeText = element(by.css('#id_purpose'));
	this.isPublishedCheckbox = element(by.css('#id_is_published'));
	this.saveButton = element(by.css('#metadata_submit_btn'));
};

module.exports = new layer_metadata_wizard();
