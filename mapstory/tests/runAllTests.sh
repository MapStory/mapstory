#!/bin/bash
exit_status=0

if [ $TRAVIS ]; then
#    SELENIUM="http://$SAUCE_USERNAME:$SAUCE_ACCESS_KEY@ondemand.saucelabs.com/wd/hub"
    SELENIUM="http://$SAUCE_USERNAME:$SAUCE_ACCESS_KEY@docker:4445/wd/hub"
else
    SELENIUM="http://$SAUCE_USERNAME:$SAUCE_ACCESS_KEY@sauce-connect:4445/wd/hub"
fi

# Run end-to-end tests
./runE2ETests.sh; (( exit_status = exit_status || $? ))

# Run acceptance tests
pushd acceptance
echo $SELENIUM
codeceptjs run --steps --override "{ \"helpers\": { \"Protractor\": { \"user\": \"$SAUCE_USERNAME\", \"key\": \"$SAUCE_ACCESS_KEY\", \"seleniumAddress\": \"$SELENIUM\"} } }"; (( exit_status = exit_status || $? ))
popd

echo "Done running all tests."
exit $exit_status
