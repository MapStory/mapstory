#!/usr/bin/env python

import os
import sys


if __name__ == "__main__":
    from django.core.management import execute_from_command_line

    env_module = "DJANGO_SETTINGS_MODULE"
    os.environ.setdefault(env_module, os.getenv(env_module, "mapstory.settings"))
   
    execute_from_command_line(sys.argv)