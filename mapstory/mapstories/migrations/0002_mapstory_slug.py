# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='mapstory',
            name='slug',
            field=models.SlugField(max_length=160, unique=True, null=True),
        ),
    ]
