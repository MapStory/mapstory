// Override for screenshots.
// This takes screenshots when something fails
'use strict';

let fs = require('fs');
let setupScreenshotOnError = function () {
	this.setup = function() {
		let originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
		jasmine.Spec.prototype.addExpectationResult = function () {
			if (!arguments[0]) {
				// take screenshot
				// this.description and arguments[1].message can be useful to constructing the filename.
				let date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;      // "+ 1" becouse the 1st month is 0
				let day = date.getDate();
				let hour = date.getHours();
				let minutes = date.getMinutes();
				let seconds = date.getSeconds();
				let filename = 'errors/err_' + year + '-' + month + '-' + day + '_' + hour + minutes + seconds + '.png';

				browser.takeScreenshot().then(function (png) {
					let stream = fs.createWriteStream(filename);
					stream.write(new Buffer(png, 'base64'));
					stream.end();
					console.log('\t***SCRENSHOT: "'+ filename + '" SMILE!***\n');
				});
			}
			return originalAddExpectationResult.apply(this, arguments);
		};
	};
};

module.exports = new setupScreenshotOnError();
