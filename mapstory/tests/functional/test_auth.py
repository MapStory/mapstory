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
    def test_signup_correct_form(self):
    # Given:
        # - User is not logged in
        # - We are on home page
        # - Signup form is visible
    # When:
        # - The user fills in correctly the signup form
    # Then:
        # - Will receive confirmation of success
        pass

    def test_sigunp_incorrect_email(self):
    # Given:
        # - User is not logged in
        # - We are on home page
        # - Signup form is visible
    # When:
        # - The user does not give a valid email
    # Then:
        # - Will receive an error message
        pass

    def test_sigunp_incorrect_terms_and_conditions(self):
    # Given:
        # - User is not logged in
        # - We are on home page
        # - Signup form is visible
    # When:
        # - The user does not consent to terms and conditions
    # Then:
        # - Will receive an error message
        pass

    def test_correct_login(self):
    # Given:
        # - The user exists
        # - User is not logged in
        # - We are on home page
        # - Login form is visible
    # When:
        # - The user provides correct credentials
    # Then:
        # - Will be authorized
        pass

    def test_incorrect_login(self):
    # Given:
        # - The user exists
        # - User is not logged in
        # - We are on home page
        # - Login form is visible
    # When:
        # - The user provides incorrect credentials
    # Then:
        # - Will receive error
        pass
