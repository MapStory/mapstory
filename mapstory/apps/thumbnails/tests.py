import os
import StringIO

from django.test import TestCase, Client
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from .models import ThumbnailImage, ThumbnailImageForm


class TestThumbnailImage(TestCase):
    """
    Thumbnail Image model tests
    """
    def setUp(self):
        self.thumbnailImage = ThumbnailImage()
        self.assertIsInstance(self.thumbnailImage, ThumbnailImage)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.thumbnailImage))

    def test_save_and_retrieve(self):
        initial_thumbnail_count = ThumbnailImage.objects.all().count()
        # Load a test gif
        image = Image.open(os.path.join('mapstory/apps/thumbnails/test.gif'))

        # Convert the image to text
        string_gif = StringIO.StringIO()
        image.save(string_gif, 'gif')
        string_gif.seek(0)

        # Create a test upload
        test_gif = SimpleUploadedFile(
            "test.gif",
            string_gif.read(),
            content_type="image/gif"
        )
        self.assertIsNotNone(image)

        # Create a thumbnail model object
        test_thumbnail = ThumbnailImage()
        test_thumbnail.thumbnail_image.save(
            'test.gif',
            content=test_gif,
            save=True
        )
        self.assertIsInstance(test_thumbnail, ThumbnailImage)

        # Should update the Thumbnail object count
        test_thumbnail.save()
        final_thumbnail_count = ThumbnailImage.objects.all().count()
        self.assertEqual(final_thumbnail_count, initial_thumbnail_count + 1)





class TestThumbnailImageForm(TestCase):
    """
    ThumbnailImageForm model tests
    """
    def setUp(self):
        self.tif = ThumbnailImageForm()
        self.assertIsInstance(self.tif, ThumbnailImageForm)

    def test_unicode(self):
        self.assertIsNotNone(unicode(self.tif))
