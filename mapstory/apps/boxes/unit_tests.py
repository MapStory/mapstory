from django.test import TestCase
from mapstory.apps.boxes.views import boxes

class BoxesViewUnitTests(TestCase):
    def test__boxes_get(self):
        self.assertIsNotNone(boxes)

    def test_boxes(self):
        try:
            boxes()
            self.fail("Expected an exception")
        except Exception as inst:
            self.assertEqual(inst.message, "boxes() takes exactly 2 arguments (0 given)")


        try:
            boxes({},{})
            self.fail("Expected an exception")
        except Exception as inst:
            self.assertIsNotNone(inst.message)



        # try:
        # except Exception as inst:
            # self.assertEqual(inst.message, "ContentType matching query does not exist.")



