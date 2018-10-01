# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0004_storyframe_storypin'),
    ]

    operations = [
        migrations.AddField(
            model_name='storypin',
            name='auto_play',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='storypin',
            name='offset',
            field=models.BigIntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='storypin',
            name='play_length',
            field=models.BigIntegerField(default=0, null=True),
        ),
    ]
