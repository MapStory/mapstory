'use strict';

// Change this to a larger number if you want to wait longer.
var waitFactor = 1.0;

// The wait times
var timings =  {
	layerUpload : 9200 * waitFactor,
	layerCreate : 5000 * waitFactor,
	newLayer: 4500 * waitFactor,
	metadata_load: 3000 * waitFactor,
};

module.exports = timings;
