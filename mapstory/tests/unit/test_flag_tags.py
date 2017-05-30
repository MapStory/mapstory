from django.test import TestCase
from mapstory.apps.flag.templatetags.flag_tags import flag


class Test_flag_tags(TestCase):
    def test_flag(self):
        self.assertIsNotNone(flag)

        creatorField = {"testing", "456"}

        try:
            flagReturn = flag(contextMock, ContentObjectMock, {"testing", "456"})
            # self.assertEqual(flagReturn["content_type"], None)
            self.assertEqual(flagReturn["object_id"], ContentObjectMock.id)
            self.assertEqual(flagReturn["creator_field"], creatorField)
            self.assertEqual(flagReturn["request"], contextMock.request)
            # self.assertEqual(flagReturn["user"], None)
        except Exception as inst:
            self.assertEqual(inst.message, "ContentType matching query does not exist.")


class ContentObjectMock:
    id = '3445'
    class _meta:
        app_label = 'mapstory'
        model_name = 'Layer'


contextMock = {
    "request": {"testing": "123"}
}
