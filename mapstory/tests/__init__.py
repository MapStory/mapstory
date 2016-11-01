"""
Notes:
------
Django's nose is supposed to find everything named `test*.py`, but won't.

According to: http://stackoverflow.com/questions/2037364/django-test-runner-not-finding-tests ,
nose has problems because the vm flags the files as executables.

The workaround is to do this: http://stackoverflow.com/a/6249739/1078537

TLDR
-----
**In order for your test file to be included in the tests add it here:**

Run all tests with: `python manage.py test mapstory.testing`

"""

from .testExtra import *
from .testFunctional import *
from .testModels import *
from .testMapstory import *
