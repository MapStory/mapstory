const fs = require("fs");

const ScreenHelper = () => {
  // abstract writing screen shot to a file
  this.writeScreenShot = (data, filename) => {
    const stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, "base64"));
    stream.end();
  };

  this.screenshot = (filename) => {
    const myself = this;
    if(filename == null) {
      const now = Date.now();
      filename = `${now.getDay()}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}`;
    }

    browser.takeScreenshot().then( (png) => {
      myself.writeScreenShot(png, `${filename}.png`);
    });
  };
};

module.exports = ScreenHelper;
