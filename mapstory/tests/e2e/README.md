# Automated Browser Tests

## About 
a.k.a. End-to-end tests, E2E Tests

Uses protractorJS to run tests on a browser.

Test configuration

Look inside `conf.js` for settings such as browser size.
To customize waiting times (for file uploading, etc) look inside `tools/wait_times.js`.

## Continous Integration

Travis CI configuration is inside `.travis.yml`. We use
`sauce_connect` to run automated tests with SauceLabs.
This requires the `sauceUser` and `saucePassword` environment variables.

## Image Comparisson

Images must follow naming convention:

`cammelCassedName`-`browser`-`width`x`height`.png

For example: `homePage-chrome-1440x800.png`

For all testing the default browser size should be: _1440 x 800_
