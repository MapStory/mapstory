"""Functional Tests for Mapstory

Uses selenium and PhantomJS.

Install selenium with:
`pip install selenium`

Install Phantom JS inside the mapstory directory with:
`npm install phantomjs-prebuilt`

"""

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from django.test import TestCase
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sites.models import Site

from ..AdminClient import AdminClient

class AuthFunctionalTests(TestCase):
    def test_create_user(self):
        pass
