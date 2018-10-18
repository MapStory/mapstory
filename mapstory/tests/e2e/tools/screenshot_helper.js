// Override for screenshots.
// This takes screenshots when something fails



const fs = require('fs');

// TODO(Zunware): Write docs
// PLEASE READ THE mapstory/tests/errors/notes.md

// TODO(Zunware): Change this to use pix-diff's screenshot
// TODO(Zunware): Implement checking error against known errors
// TODO(Zunware): Create a feature for reporting results to central server

const setupScreenshotOnError = function () {
	this.setup = function() {
		const originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
		jasmine.Spec.prototype.addExpectationResult = function () {
			if (!arguments[0]) {
				// take screenshot
				// this.description and arguments[1].message can be useful to constructing the filename.
				const date = new Date();
				const year = date.getFullYear();
				const month = date.getMonth() + 1;      // "+ 1" becouse the 1st month is 0
				const day = date.getDate();
				const hour = date.getHours();
				const minutes = date.getMinutes();
				const seconds = date.getSeconds();
				const filename = `errors/err_${  year  }-${  month  }-${  day  }_${  hour  }${minutes  }${seconds  }.png`;

				browser.takeScreenshot().then((png) => {
					const stream = fs.createWriteStream(filename);
					stream.write(new Buffer(png, 'base64'));
					stream.end();
					console.log(`\t***SCREENSHOT: "${ filename  }" SMILE!***\n`);
				});
			}
			return originalAddExpectationResult.apply(this, arguments);
		};
	};
};

module.exports = new setupScreenshotOnError();
