#!/usr/bin/env bash
coverage run --branch --source=mapstory ./manage.py test # && \
coverage report # && \
coverage html -d cover
