#!/usr/bin/env bash
# There are some dependencies for testing mapstory
if [ "$TRAVIS" = true ];
then
    #sudo su mapstory
    #workon mapstory
    pip install selenium
    # data-driven tests with ddt:
    pip install ddt
    # Behavior-driven tests with behave:
    pip install behave
fi
