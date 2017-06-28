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
        thumbnail_width = 250
        thumbnail_height = 150

        pil_image_obj = Image.open(self.thumbnail_image)
        new_image_io = BytesIO()

        if self.thumbnail_image.name.endswith('.gif'):
            # Save all frames as GIF
            gif_image = pil_image_obj
            gif_image.save(new_image_io, format='GIF', save_all=True)
        else:
            # Save as PNG
            new_image = resizeimage.resize_cover(
                pil_image_obj,
                [thumbnail_width, thumbnail_height],
                validate=False
            )
            new_image.save(new_image_io, format='PNG')

        # Continue to overwrite the saved thumbnail
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
