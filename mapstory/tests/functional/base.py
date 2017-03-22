'''
from unittest import skip

from django.test import TestCase

from selenium import webdriver


class FunctionalTest(TestCase):
    """Generic Functional Test

    - Sets up the browser with phantomJS
    - Tears down the browser when done
    - Knows how to assert search results

    Attributes:
        browser (WebDriver): The Selenium headless browser
    """
    def setUp(self):
        self.browser = webdriver.PhantomJS(
            executable_path=r'/srv/git/mapstory/mapstory/node_modules/phantomjs/lib/phantom/bin/phantomjs')
        self.browser.implicitly_wait(1)
        # self.browser.set_window_size(1120, 600)
        self.browser.set_window_size(1920, 1080)

    def tearDown(self):
        self.browser.quit()
'''
