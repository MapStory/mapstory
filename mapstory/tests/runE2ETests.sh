#!/bin/bash
# Note: First start the server with: `webdriver-manager start`

exists()
{
  command -v "$1" >/dev/null 2>&1
}

exit_status=0

if exists figlet; then
	figlet "Mapstory-tests"; (( exit_status = exit_status || $? ))
else
	echo ''
	echo '----------------'
	echo 'Mapstory Tests'
	echo '----------------'
	echo ''
fi

if exists protractor; then
	protractor e2e/conf.js; (( exit_status = exit_status || $? ))
else
	echo 'Error: Could not find conf, or protractor is not installed!'
	echo 'Please install protractor from: protractortest.org'
	echo ''
fi

if exists cowsay; then
	cowsay "Done"
fi

exit $exit_status
