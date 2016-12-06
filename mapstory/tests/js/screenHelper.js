var fs = require('fs');

var screenHelper = function() {
	// abstract writing screen shot to a file
	this.writeScreenShot = function(data, filename) {
		var stream = fs.createWriteStream(filename);
		stream.write(new Buffer(data, 'base64'));
		stream.end();
	};

	this.screenshot = function(filename){
		if(filename == null) {
			var now = Date.now();
			filename = now.getDay() + '_' + now.getHours() + '_' + now.getMinutes() + '_' + now.getSeconds();
		}

		browser.takeScreenshot().then(function (png) {
			this.writeScreenShot(png, filename+'.png');
		});
	};
};

module.exports = screenHelper;
