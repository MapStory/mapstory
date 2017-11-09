#!/bin/bash
exit_status=0

if [ $TRAVIS ]; then
    SELENIUM="ondemand.saucelabs.com/wd/hub"
else
    SELENIUM="sauce-connect:4445/wd/hub"
fi

# Run end-to-end tests
./runE2ETests.sh; (( exit_status = exit_status || $? ))

# Run acceptance tests
pushd acceptance
codeceptjs run --steps --override "{ \"helpers\": { \"Protractor\": { \"seleniumAddress\": \"http://$SAUCE_USERNAME:$SAUCE_ACCESS_KEY@$SELENIUM\"} } }"; (( exit_status = exit_status || $? ))
popd

echo "Done running all tests."
exit $exit_status
