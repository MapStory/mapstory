"""Functional Tests for Mapstory

Uses selenium and PhantomJS.

Install selenium with:
`pip install selenium`

Install Phantom JS inside the mapstory directory with:
`npm install PhantomJS`

"""
from django.test import TestCase
from django.conf import settings

from selenium import webdriver
from selenium.webdriver.common.keys import Keys

class FunctionalTest(TestCase):
    """Generic Functional Test

    - Sets up the browser with phantomJS
    - Tears down the browser when done
    - Knows how to assert search results
    
    Attributes:
        browser (WebDriver): The Selenium headless browser
    """
    def setUp(self):
        self.browser = webdriver.PhantomJS(executable_path=r'/srv/git/mapstory/mapstory/node_modules/phantomjs/lib/phantom/bin/phantomjs')
        self.browser.implicitly_wait(3)
        self.browser.set_window_size(1120,600)

    def tearDown(self):
        self.browser.quit()

    def check_for_text_in_search_results(self, text):
        """Asserts if text is part of search results

        Args:
            text (string): The text to search for
        """
        table = self.browser.find_element_by_css_selector('div.clearfix.search-results')
        self.assertIsNotNone(table)
        results = table.find_elements_by_tag_name('li')
        print("This many: %d" % len(results) )

        for result in results:
            self.assertIn(text, result.text)



class NewVisitorTest(FunctionalTest):
    
    def test_home_has_titles(self):
        # User opens mapstory
        self.browser.get(settings.SITEURL)
        # She sees the title and confirms she is on the correct site
        self.assertIn(u'MapStory', self.browser.title)
        body = self.browser.find_element_by_tag_name('body').text
        self.assertIn(u'The atlas of change anyone can edit', body )
        # She also sees sponsors
        self.assertIn(u'Our Sponsors', body )


class TestSearchFunctionality(FunctionalTest):

    def test_home_searchbar_redirect(self):
        # User opens mapstory
        self.browser.get(settings.SITEURL)
        # notices the search bar
        searchBar = self.browser.find_element_by_name('q')
        self.assertIsNotNone(searchBar, "Failed to find a search bar")
        # Types someting into search
        searchBar.send_keys('')
        searchBar.send_keys(Keys.ENTER)
        # the page changes to show results if any
        self.assertIn('search', self.browser.current_url, 'search not in URL')

    def test_home_search_story(self):
        # User opens mapstory
        self.browser.get(settings.SITEURL)
        searchBar = self.browser.find_element_by_name('q')
        # Types someting into search
        searchBar.send_keys('')
        searchBar.send_keys(Keys.ENTER)
        # the page changes to show results if any
        self.assertIn('search', self.browser.current_url, 'search not in URL')
        self.check_for_text_in_search_results(u'Lewisandclark')



