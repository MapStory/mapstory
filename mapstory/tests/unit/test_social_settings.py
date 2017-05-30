from django.test import TestCase
from mapstory.social_settings import flag_handler


class flagged_instance_mock:
    flag_type = 'inappropriate'
    pk = 'testing123'


class flagged_content_mock:
    content_object = {'testing': '123'}


class SocialSettingsUnitTest(TestCase):
    def test_flag_handler(self):
        self.assertIsNotNone(flag_handler)
        flag_handler(flagged_instance_mock, flagged_content_mock)

        # Test the other type of flag
        flagged_instance_mock.flag_type = 'broken'
        flag_handler(flagged_instance_mock, flagged_content_mock)
