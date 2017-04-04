# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0005_auto_20170323_1811'),
    ]

    operations = [
        migrations.AddField(
            model_name='map',
            name='viewer_playbackmode',
            field=models.CharField(max_length=32, null=True, verbose_name='Viewer Playback', blank=True),
        ),
    ]
