#!/usr/bin/env bash
# There are some dependencies for testing mapstory
if [ "$TRAVIS" = true ];
then
    #sudo su mapstory
    #workon mapstory
    pip install selenium
    npm install pix-diff
fi
