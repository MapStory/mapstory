from PIL import Image
from django.db import models
import os
from django.conf import settings
from django import forms
from solo.models import SingletonModel
from io import BytesIO
from django.core.files.base import ContentFile


def resize_gif(path, save_as=None, resize_to=None):
    """
    Resizes the GIF to a given length:
    Args:
        path: the path to the GIF file
        save_as (optional): Path of the resized gif. If not set, the original gif will be overwritten.
        resize_to (optional): new size of the gif. Format: (int, int). If not set, the original GIF will be resized to
                              half of its size.
    """
    all_frames = extract_and_resize_frames(path, resize_to)

    if not save_as:
        save_as = path

    if len(all_frames) == 1:
        print("Warning: only 1 frame found")
        all_frames[0].save(save_as, optimize=True)
    else:
        all_frames[0].save(save_as, optimize=True, save_all=True, append_images=all_frames[1:], loop=1000, duration=500)


def analyze_image(path):
    """
    Pre-process pass over the image to determine the mode (full or additive).
    Necessary as assessing single frames isn't reliable. Need to know the mode
    before processing all frames.
    """
    image = Image.open(path)
    results = {
        'size': image.size,
        'mode': 'full',
    }
    try:
        while True:
            if image.tile:
                tile = image.tile[0]
                update_region = tile[1]
                update_region_dimensions = update_region[2:]
                if update_region_dimensions != image.size:
                    results['mode'] = 'partial'
                    break
            image.seek(image.tell() + 1)
    except EOFError:
        pass

    return results


def extract_and_resize_frames(path, resize_to=None):
    """
    Iterate the GIF, extracting each frame and resizing them
    Returns:
        An array of all frames
    """
    mode = analyze_image(path)['mode']

    image = Image.open(path)

    if not resize_to:
        resize_to = (image.size[0] // 2, image.size[1] // 2)

    i = 0
    p = image.getpalette()
    last_frame = image.convert('RGBA')

    all_frames = []

    try:
        while True:
            # print("saving %s (%s) frame %d, %s %s" % (path, mode, i, image.size, image.tile))

            '''
            If the GIF uses local colour tables, each frame will have its own palette.
            If not, we need to apply the global palette to the new frame.
            '''
            if not image.getpalette():
                image.putpalette(p)

            new_frame = Image.new('RGBA', image.size)

            '''
            Is this file a "partial"-mode GIF where frames update a region of a different size to the entire image?
            If so, we need to construct the new frame by pasting it on top of the preceding frames.
            '''
            if mode == 'partial':
                new_frame.paste(last_frame)

            new_frame.paste(image, (0, 0), image.convert('RGBA'))

            new_frame.thumbnail(resize_to, Image.ANTIALIAS)
            all_frames.append(new_frame)

            i += 1
            last_frame = new_frame
            image.seek(image.tell() + 1)
    except EOFError:
        pass

    return all_frames


class ThumbnailImage(SingletonModel):
    thumbnail_image = models.ImageField(
        upload_to=os.path.join(settings.MEDIA_ROOT, 'thumbs'),
    )

    def save(self, *args, **kwargs):
        new_image_io = BytesIO()
        thumbnail_width = 200
        thumbnail_height = 150

        # Open the uploaded image
        pil_image_obj = Image.open(self.thumbnail_image)

        # Supports Animated thumbnails
        if self.thumbnail_image.name.endswith('.gif'):
            gif_image = pil_image_obj
            gif_image.save(new_image_io, format='GIF', save_all=True, duration=500)
        else:
            # Save as PNG
            new_image = pil_image_obj.resize((thumbnail_width, thumbnail_height))
            new_image.save(new_image_io, format='PNG')

        # Continue to overwrite the saved thumbnail
        temp_name = self.thumbnail_image.name
        self.thumbnail_image.delete(save=False)

        # Save the new image_io
        self.thumbnail_image.save(
            temp_name,
            content=ContentFile(new_image_io.getvalue()),
            save=False,
        )

        # Once the gif is saved and we can access it, resize it.
        if self.thumbnail_image.name.endswith('.gif'):
            resize_gif(str(self.thumbnail_image.path), None, (thumbnail_width, thumbnail_height))

        super(ThumbnailImage, self).save(*args, **kwargs)


class ThumbnailImageForm(forms.Form):
    thumbnail_image = forms.FileField(
        label='Select a file',
    )
