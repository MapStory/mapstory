/**
 * Icon Upload Wizard Page Object
 * ==============================
 */
require("../tools/waitReady.js");
const path = require("path");

const testPNGRelative = "../../sampledata/icon.png";
const testPNGFile = path.resolve(__dirname, testPNGRelative);

const testSVGRelative = "../../sampledata/icon-github.svg";
const testSVGFile = path.resolve(__dirname, testSVGRelative);

function IconUploadWizard() {
  this.getPNGPath = () => {
    return testPNGFile;
  };

  this.getSVGPath = () => {
    return testSVGFile;
  };

  this.getSuccessText = () => {
    return "Congratulations! Your upload was successful. You can see your icons on your profile page." +
      " When you're composing a story with point layers, you'll be able to style your points with" +
      " any icons uploaded by any storyteller in the Icons Commons!";
  };
};

module.exports = new IconUploadWizard();
