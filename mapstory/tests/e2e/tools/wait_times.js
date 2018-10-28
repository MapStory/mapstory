

// Change this to a larger number if you want to wait longer.
const waitFactor = 2.1;


// The wait times in milliseconds
const timings =  {
  layerUpload : 4500 * waitFactor,
  layerCreate : 5000 * waitFactor,
  newLayer: 4500 * waitFactor,
  metadataLoad: 3000 * waitFactor,
  search: 1000 * waitFactor,
  composerTourModal: 1000 * waitFactor,
  textInput: 1000 * waitFactor
};

export default timings;
