from unittest import skip

from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.test import TestCase

from ...tests.MapStoryTestMixin import MapStoryTestMixin
from ...tests.AdminClient import AdminClient
from ...utils import parse_schema, error_response, Link

from mock import MagicMock

from mapstory.notifications import (
    favorite_post_save,
    comment_post_save,
    post_save_message,
    pre_save_map,
    post_save_rating,
    notify_download,
    set_profile_notification
)



class TestNotifications(MapStoryTestMixin):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    @skip("TODO: Fix")
    def test_favorite_post_save(self):
        instance = MagicMock()
        instance.content_object = MagicMock()
        instance.content_object.class_name = MagicMock(return_value = 'A')
        instance.content_object.owner = MagicMock(return_value = 'B')
        instance.user = MagicMock(return_value = 'A')
        favorite_post_save(instance, MagicMock())