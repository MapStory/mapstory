#!/bin/bash
# Note: First start the server with: `webdriver-manager start`
#
#

exists()
{
  command -v "$1" >/dev/null 2>&1
}

if exists figlet; then
	figlet "Mapstory-tests"
else
	echo ''
	echo '----------------'
	echo 'Mapstory Tests'
	echo '----------------'
	echo ''
fi

if exists protractor; then
	protractor js/conf.js
else
	echo 'Error: protractor is not installed!'
	echo 'Please install protractor from: protractortest.org'
	echo ''
fi

if exists cowsay; then
	cowsay "Done"
fi
