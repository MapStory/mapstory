# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ThumbnailImage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('thumbnail_image', models.ImageField(upload_to=b'/var/lib/mapstory/media/thumbs')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
