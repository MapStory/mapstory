#!/usr/bin/env python
# this file must be in unix EOL format to be run by django within a provisioned unix environment.
import os
import sys


if __name__ == "__main__":
    from django.core.management import execute_from_command_line

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mapstory.settings")
    execute_from_command_line(sys.argv)

