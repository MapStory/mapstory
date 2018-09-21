// Override for screenshots.
// This takes screenshots when something fails
const fs = require("fs");

// PLEASE READ THE mapstory/tests/errors/notes.md

const SetupTakeScreenshotOnError = () => {
  this.setup = () => {
    const originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
    jasmine.Spec.prototype.addExpectationResult = () => {
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
        const filename = `errors/err_${year}-${month}-${day}_${hour}${minutes}${seconds}.png`;

        browser.takeScreenshot().then( (png) => {
          const stream = fs.createWriteStream(filename);
          stream.write(new Buffer(png, "base64"));
          stream.end();
          console.log(`Saved error screenshot: ${filename}`);
        });
      }
      return originalAddExpectationResult.apply(this, arguments);
    };
  };
};

module.exports = new SetupTakeScreenshotOnError();
