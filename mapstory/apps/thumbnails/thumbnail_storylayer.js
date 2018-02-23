var page = require('webpage').create();
var system = require('system');
var args = system.args;


//
//phantomjs --ignore-ssl-errors=true --web-security=false ol.pj thumnail_storylayer.html "https://docker/geoserver/geonode/wms" US_HistStateTerr_Gen0001_3aa6272c  -179.14736938476562  18.910842895507812 -66.9498291015625 71.38961791992188  ALL github.png
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

if (args.length != 11) {
    system.stdout.writeLine('run with args: htmlFname wms layerName xmin ymin xmax ymax time output.fname quiet');
    phantom.exit(-1);
}

//parse from command line
var htmlFname = args[1]
var wms = args[2];
var layerName = args[3].toLowerCase();
var xmin = parseFloat(args[4]);
var ymin = parseFloat(args[5]);
var xmax = parseFloat(args[6]);
var ymax = parseFloat(args[7]);
var timeRange = args[8].toLowerCase();
var outFname = args[9];
var quiet = args[10].toLowerCase() == 'true';


if (timeRange.toLowerCase() == "all")
    timeRange = '-99999999999-01-01T00:00:00.0Z/99999999999-01-01T00:00:00.0Z';

if (!quiet) {
    system.stdout.writeLine('wms = ' + wms);
    system.stdout.writeLine('layerName = ' + layerName);
    system.stdout.writeLine('xmin = ' + (xmin));
    system.stdout.writeLine('ymin = ' + (ymin));
    system.stdout.writeLine('xmax = ' + (xmax));
    system.stdout.writeLine('ymax = ' + (ymax));
    system.stdout.writeLine('timeRange = ' + timeRange);
    system.stdout.writeLine('outFname = ' + outFname);
    system.stdout.writeLine('quiet = ' + quiet);

    // add some debugging output
    addDebugEvents(page, system);
}


//open the HTML file and get ready to screen grab
page.open(htmlFname, function () {
    //get the map setup in the OL app
    page.evaluate(function (wms, layerName, xmin, ymin, xmax, ymax, time) {
        setup(wms, layerName, xmin, ymin, xmax, ymax, time);
    }, wms, layerName, xmin, ymin, xmax, ymax, timeRange);

    // if it takes too long, hard close
    setTimeout(function () {
        phantom.exit(2);
    }, 60000);

    //keep checking for ready_for_screenshot to be 1
    setInterval(function () {
            //wait for ol to be ready to take a screen shot
            var ready_for_screenshot = page.evaluate(function () {
                return window.ready_for_screenshot || window.error_occured != '';
            });
            // need to keep waiting?
            if (!ready_for_screenshot)
                return;
            //page is up!
            var error_text = page.evaluate(function () {
                return  window.error_occured;
            });
            if (error_text != ''){
                system.stdout.writeLine('phantomjs - error occured - '+error_text);
                phantom.exit(1);
            }

            queueTakingSnapshot();
        }
        , 100);  //re-try every 100ms

    //unfortunately, OL does not have an easy way to determine
    // if the map is completely drawn.
    // when ready_for_screenshot become True, then the map is mostly
    // drawn -- but, there might be more rendering occuring if there is wrapping occuring
    // (i.e. 180/+180).  We wait 1 second for this rendering to occur.
    // NOTE: all the data is local, so this should just be drawing images - no remote data movement.
    function queueTakingSnapshot() {
        setTimeout(function () {
            takescreenshot();
        }, 1000);

    }

    //take screenshot - determine the size/location of the map div and then take the screenshot
    function takescreenshot() {
        if (!quiet)
            system.stdout.writeLine('taking screenshot...');
        var clipRect = page.evaluate(function () {
            var cr = document.querySelector("#map").getBoundingClientRect();
            return cr;
        });

        page.clipRect = {
            top: clipRect.top,
            left: clipRect.left,
            width: clipRect.width,
            height: clipRect.height
        };

        page.render(outFname, {format: 'png'});
        if (!quiet)
            system.stdout.writeLine('done screenshot...');
        phantom.exit(0);//all done - quit with OK
    }

});


function addDebugEvents(page, system) {


    page.onResourceRequested = function (request) {
        system.stdout.writeLine('onResourceRequested');
        system.stdout.writeLine('  +  url: ' + request.url);
    };

    page.onResourceReceived = function (response) {
        system.stdout.writeLine('onResourceReceived');
        system.stdout.writeLine('  url: ' + response.url);
    };


    page.onNavigationRequested = function (url, type, willNavigate, main) {
        system.stdout.writeLine('onNavigationRequested');
        system.stdout.writeLine('  url: ' + url);
    };

    page.onConsoleMessage = function (msg) {
        system.stdout.writeLine('CONSOLE: ' + msg);
    };

    page.onResourceError = function (resourceError) {
        system.stdout.writeLine('onResourceError');
        system.stdout.writeLine('  error: ' + resourceError.errorString);
        system.stdout.writeLine('  url: ' + resourceError.url);
    };

    page.onResourceError = function (resourceError) {
        system.stdout.writeLine('onResourceError');
        system.stdout.writeLine('  - url: ' + resourceError.url);
        system.stdout.writeLine('  - errorCode: ' + resourceError.errorCode);
        system.stdout.writeLine('  - errorString: ' + resourceError.errorString);
    };

    // from http://phantomjs.org/api/phantom/handler/on-error.html
    page.onError = function (msg, trace) {
        var msgStack = ['PHANTOM ERROR: ' + msg];

        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach(function (t) {
                msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
            });
        }
        system.stdout.writeLine(msgStack.join('\n'));
    };

}
