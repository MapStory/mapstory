from unittest import skip

from django.test import TestCase

from mapstory.models import NewsItem


class TestNewsItem(TestCase):
    """
    NewsItem model tests
    """

    def setUp(self):
        self.newsItem = NewsItem()
        self.newsItem.item = "Test Item"
        self.assertIsInstance(self.newsItem, NewsItem)

    def test_import(self):
        self.assertIsNotNone(NewsItem)

    def test_unicode(self):
        self.assertIsNotNone(str(self.newsItem))

    @skip
    def test_save_and_retrieve(self):
        self.newsItem.save()

    @skip
    def test_publication_time(self):
        self.assertIsNotNone(self.newsItem.publication_time())
