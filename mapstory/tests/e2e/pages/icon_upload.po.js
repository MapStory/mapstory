/**
 * Icon Upload Wizard Page Object
 * ==============================
 */



import "../tools/waitReady";
import { resolve } from "path";

const testPNGRelative = "../../sampledata/icon.png";
const testPNGFile = resolve(__dirname, testPNGRelative);

const testSVGRelative = "../../sampledata/icon-github.svg";
const testSVGFile = resolve(__dirname, testSVGRelative);

const IconUploadWizard = () => {
  this.getPNGPath = () => testPNGFile;

  this.getSVGPath = () => testSVGFile;

  this.getSuccessText = () => "Congratulations! Your upload was successful. You can see your icons on your profile page." +
      " When you're composing a story with point layers, you'll be able to style your points with" +
      " any icons uploaded by any storyteller in the Icons Commons!";
};

export default new IconUploadWizard();
