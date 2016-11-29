from PIL import Image
from django.db import models
import os
from django.conf import settings
from django import forms
from solo.models import SingletonModel
from resizeimage import resizeimage
from io import BytesIO
from django.core.files.base import ContentFile

class ThumbnailImage(SingletonModel):
    thumbnail_image = models.ImageField(
        upload_to=os.path.join(settings.MEDIA_ROOT, 'thumbs'),
    )

    def save(self, *args, **kwargs):
        pil_image_obj = Image.open(self.thumbnail_image)
        new_image = resizeimage.resize_cover(
            pil_image_obj,
            [250, 150],
            validate=False
        )

        new_image_io = BytesIO()
        new_image.save(new_image_io, format='PNG')

        temp_name = self.thumbnail_image.name
        self.thumbnail_image.delete(save=False)

        self.thumbnail_image.save(
            temp_name,
            content=ContentFile(new_image_io.getvalue()),
            save=False
        )

        super(ThumbnailImage, self).save(*args, **kwargs)


class ThumbnailImageForm(forms.Form):
    thumbnail_image = forms.FileField(
        label='Select a file',
    )
