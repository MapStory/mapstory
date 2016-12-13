"""
Notes:
------
Django's nose is supposed to find everything named `test*.py`, but won't.

According to: http://stackoverflow.com/questions/2037364/django-test-runner-not-finding-tests ,
nose has problems because the vm flags the files as executables.

TLDR
-----
**In order for your test file to be included in the tests add it here:**

Run all tests with: `python manage.py test mapstory.test`
"""

from tests.testOrganizations import *
# from tests.testInitiatives import *
# from tests.testExtra import *
# from tests.testFunctional import *
# from tests.testModels import *
# from tests.testMapstory import *
# from journal.tests import *
# from apps.boxes.tests import *
# from apps.flag.tests import *
# from apps.thumbnails.tests import *
