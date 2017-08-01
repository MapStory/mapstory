# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='mapstory',
            name='slug',
            field=models.SlugField(default=datetime.datetime(2017, 7, 28, 14, 2, 48, 889460), max_length=160),
            preserve_default=False,
        ),
    ]
