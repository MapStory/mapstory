const fs = require('fs');

const screenHelper = function() {
	// abstract writing screen shot to a file
	this.writeScreenShot = function(data, filename) {
		const stream = fs.createWriteStream(filename);
		stream.write(new Buffer(data, 'base64'));
		stream.end();
	};

	this.screenshot = function(filename){
		const myself = this;
		if(filename == null) {
			const now = Date.now();
			filename = `${now.getDay()  }_${  now.getHours()  }_${  now.getMinutes()  }_${  now.getSeconds()}`;
		}

		browser.takeScreenshot().then((png) => {
			myself.writeScreenShot(png, `${filename}.png`);
		});
	};
};

module.exports = screenHelper;
