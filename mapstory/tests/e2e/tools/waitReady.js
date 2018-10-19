/**
 * Source: https://gist.github.com/elgalu/2939aad2b2e31418c1bb
 *
 * Actively wait for an element present and displayed up to specTimeoutMs
 * ignoring useless webdriver errors like StaleElementError.
 *
 * Usage:
 * Add `require('./waitReady.js');` in your onPrepare block or file.
 *
 * @example
 * expect($('.some-html-class').waitReady()).toBeTruthy();
 */



// Config
const specTimeoutMs = 60000; // 60 seconds

/**
 * Current workaround until https://github.com/angular/protractor/issues/1102
 * @type {Function}
 */
const ElementFinder = $('').constructor;

ElementFinder.prototype.waitReady = function(opt_optStr) {
	const self = this;
	let driverWaitIterations = 0;
	let lastWebdriverError;
	function _throwError() {
		throw new Error(`Expected '${  self.locator().toString() 
			}' to be present and visible. ` +
			`After ${  driverWaitIterations  } driverWaitIterations. ` +
			`Last webdriver error: ${  lastWebdriverError}`);
	}

	function _isPresentError(err) {
		lastWebdriverError = (err != null) ? err.toString() : err;
		return false;
	}

	return browser.driver.wait(() => {
		driverWaitIterations++;
		if (opt_optStr === 'withRefresh') {
			// Refresh page after more than some retries
			if (driverWaitIterations > 7) {
				_refreshPage();
			}
		}
		return self.isPresent().then((present) => {
			if (present) {
				return self.isDisplayed().then((visible) => {
					lastWebdriverError = `visible:${  visible}`;
					return visible;
				}, _isPresentError);
			} 
				lastWebdriverError = `present:${  present}`;
				return false;
			
		}, _isPresentError);
	}, specTimeoutMs).then((waitResult) => {
		if (!waitResult) { _throwError(); }
		return waitResult;
	}, (err) => {
		_isPresentError(err);
		_throwError();
		return false;
	});
};

// Helpers
function _refreshPage() {
	// Swallow useless refresh page webdriver errors
	browser.navigate().refresh().then(() => {}, (e) => {});
}
