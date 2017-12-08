#!/bin/bash
# expects $SOURCE_HOME

if [ $TRAVIS ]; then
    SELENIUM="http://$SAUCE_USERNAME:$SAUCE_ACCESS_KEY@docker:4445/wd/hub"
    CAPABILITIES="
    {
        'browserName' : 'firefox',
        'tunnel-identifier': '$TRAVIS_JOB_NUMBER',
        'name': 'Mapstory Acceptance Firefox Tests',
        'build': '$TRAVIS_BUILD_NUMBER',
        'tags': ['$TRAVIS_PYTHON_VERSION', 'CI']
    }"

    OVERRIDE="
    {
        'helpers': {
            'Protractor': {
                'user': '$SAUCE_USERNAME',
                'key': '$SAUCE_ACCESS_KEY',
                'seleniumAddress': '$SELENIUM',
                'capabilities': $CAPABILITIES
            }
        }
    }"
else
    SELENIUM="http://selenium:4444/wd/hub"
    OVERRIDE="
    {
        'helpers': {
            'Protractor': {
                'seleniumAddress': '$SELENIUM'
            }
        }
    }"
fi

OVERRIDE=${OVERRIDE//\'/\"} # replace single quotes with double quotes

cd $SOURCE_HOME/mapstory/tests/acceptance
codeceptjs "$@" --override "$OVERRIDE"
