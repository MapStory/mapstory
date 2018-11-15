import { createWriteStream } from "fs";

const screenHelper = () => {
  // abstract writing screen shot to a file
  this.writeScreenShot = (data, filename) => {
    const stream = createWriteStream(filename);
    stream.write(new Buffer(data, "base64"));
    stream.end();
  };

  this.screenshot = (filename) => {
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

export default screenHelper;
