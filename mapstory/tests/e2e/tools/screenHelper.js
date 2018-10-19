let fs = require('fs');

let screenHelper = function() {
	// abstract writing screen shot to a file
	this.writeScreenShot = function(data, filename) {
		let stream = fs.createWriteStream(filename);
		stream.write(new Buffer(data, 'base64'));
		stream.end();
	};

	this.screenshot = function(filename){
		let myself = this;
		if(filename == null) {
			let now = Date.now();
			filename = now.getDay() + '_' + now.getHours() + '_' + now.getMinutes() + '_' + now.getSeconds();
		}

		browser.takeScreenshot().then(function (png) {
			myself.writeScreenShot(png, filename+'.png');
		});
	};
};

module.exports = screenHelper;
