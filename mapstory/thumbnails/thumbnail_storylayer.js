const page = require('webpage').create();
const system = require('system');

const args = system.args;


//
// phantomjs --ignore-ssl-errors=true --web-security=false ol.pj thumnail_storylayer.html "https://docker/geoserver/geonode/wms" US_HistStateTerr_Gen0001_3aa6272c  -179.14736938476562  18.910842895507812 -66.9498291015625 71.38961791992188  ALL github.png
//


// Generate a thumbnail for a story layer
// This;
//  a) setup command line arguments
//  b) passes command line arguments to the webpage
//  c) waits until the webpage is ready for a screenshot (ready_for_screenshot=true)
//  d) waits for one second (to allow any wrapped (+180/-180) tiles to render)
//  e) saves the thumbnail
//
// exit code
//   0 = ok
//   1 = error occured (likely trying to get an WMS image/tile)
//   2 = timeout
//
// NOTE: with phantomjs 2.1.1, you might see an error having to do with "about:blank"
//       and security ("Blocked a frame with origin...").  Ignore this - it doesn't happen if there
//       wasn't already an error).

if (args.length != 12) {
    system.stdout.writeLine('run with args: htmlFname wms layerName xmin ymin xmax ymax time output.fname basemapXYZURL styles');
    phantom.exit(-1);
}

// parse from command line
const htmlFname = args[1]
const wms = args[2];
const layerNames = args[3].toLowerCase();
const xmin = parseFloat(args[4]);
const ymin = parseFloat(args[5]);
const xmax = parseFloat(args[6]);
const ymax = parseFloat(args[7]);
let timeRange = args[8];
const outFname = args[9];
const basemapXYZURL = args[10];
const styles = args[11];



if (timeRange.toLowerCase() == "all")
    timeRange = '-99999999999-01-01T00:00:00.0Z/99999999999-01-01T00:00:00.0Z';


    system.stdout.writeLine(`wms = ${  wms}`);
    system.stdout.writeLine(`layerNames = ${  layerNames}`);
    system.stdout.writeLine(`xmin = ${  xmin}`);
    system.stdout.writeLine(`ymin = ${  ymin}`);
    system.stdout.writeLine(`xmax = ${  xmax}`);
    system.stdout.writeLine(`ymax = ${  ymax}`);
    system.stdout.writeLine(`timeRange = ${  timeRange}`);
    system.stdout.writeLine(`outFname = ${  outFname}`);
    system.stdout.writeLine(`basemapXYZURL = ${  basemapXYZURL}`);
    system.stdout.writeLine(`styles = ${  styles}`);
    // add some debugging output
    addDebugEvents(page, system);



// open the HTML file and get ready to screen grab
page.open(htmlFname, () => {
    // get the map setup in the OL app
    page.evaluate((wms, layerNames,styles, xmin, ymin, xmax, ymax, time,basemapXYZURL) => {
        setup(wms, layerNames,styles, xmin, ymin, xmax, ymax, time,basemapXYZURL);
    }, wms, layerNames,styles, xmin, ymin, xmax, ymax, timeRange,basemapXYZURL);

    // if it takes too long, hard close
    setTimeout(() => {
        phantom.exit(2);
    }, 60000);

    // keep checking for ready_for_screenshot to be 1
    setInterval(() => {
            // wait for ol to be ready to take a screen shot
            const ready_for_screenshot = page.evaluate(() => window.ready_for_screenshot || window.error_occured != '');
            // need to keep waiting?
            if (!ready_for_screenshot)
                return;
            // page is up!
            const error_text = page.evaluate(() => window.error_occured);
            if (error_text != ''){
                system.stdout.writeLine(`phantomjs - error occured - ${error_text}`);
                phantom.exit(1);
            }

            queueTakingSnapshot();
        }
        , 100);  // re-try every 100ms

    // unfortunately, OL does not have an easy way to determine
    // if the map is completely drawn.
    // when ready_for_screenshot become True, then the map is mostly
    // drawn -- but, there might be more rendering occuring if there is wrapping occuring
    // (i.e. 180/+180).  We wait 1 second for this rendering to occur.
    // NOTE: all the data is local, so this should just be drawing images - no remote data movement.
    function queueTakingSnapshot() {
        setTimeout(() => {
            takescreenshot();
        }, 1000);

    }

    // take screenshot - determine the size/location of the map div and then take the screenshot
    function takescreenshot() {

        system.stdout.writeLine('taking screenshot...');
        const clipRect = page.evaluate(() => {
            const cr = document.querySelector("#map").getBoundingClientRect();
            return cr;
        });

        page.clipRect = {
            top: clipRect.top,
            left: clipRect.left,
            width: clipRect.width,
            height: clipRect.height
        };

        page.render(outFname, {format: 'png'});
        system.stdout.writeLine('done screenshot...');
        phantom.exit(0);// all done - quit with OK
    }

});


function addDebugEvents(page, system) {


    page.onResourceRequested = function (request) {
        system.stdout.writeLine('onResourceRequested');
        system.stdout.writeLine(`  +  url: ${  request.url}`);
    };

    page.onResourceReceived = function (response) {
        system.stdout.writeLine('onResourceReceived');
        system.stdout.writeLine(`  url: ${  response.url}`);
    };


    page.onNavigationRequested = function (url, type, willNavigate, main) {
        system.stdout.writeLine('onNavigationRequested');
        system.stdout.writeLine(`  url: ${  url}`);
    };

    page.onConsoleMessage = function (msg) {
        system.stdout.writeLine(`CONSOLE: ${  msg}`);
    };

    page.onResourceError = function (resourceError) {
        system.stdout.writeLine('onResourceError');
        system.stdout.writeLine(`  error: ${  resourceError.errorString}`);
        system.stdout.writeLine(`  url: ${  resourceError.url}`);
    };

    page.onResourceError = function (resourceError) {
        system.stdout.writeLine('onResourceError');
        system.stdout.writeLine(`  - url: ${  resourceError.url}`);
        system.stdout.writeLine(`  - errorCode: ${  resourceError.errorCode}`);
        system.stdout.writeLine(`  - errorString: ${  resourceError.errorString}`);
    };

    // from http://phantomjs.org/api/phantom/handler/on-error.html
    page.onError = function (msg, trace) {
        const msgStack = [`PHANTOM ERROR: ${  msg}`];

        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach((t) => {
                msgStack.push(` -> ${  t.file || t.sourceURL  }: ${  t.line  }${t.function ? ` (in function ${  t.function  })` : ''}`);
            });
        }
        system.stdout.writeLine(msgStack.join('\n'));
    };

}
