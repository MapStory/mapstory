#!/usr/bin/env bash
coverage run --branch --source=mapstory.apps ./manage.py test # && \
coverage report # && \
coverage html -d cover
