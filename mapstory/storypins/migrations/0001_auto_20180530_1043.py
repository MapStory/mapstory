# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('storypins', 'rename_annotations_models'),
    ]

    operations = [
        migrations.RenameField(
            model_name='storypin',
            old_name='end_time',
            new_name='endTime',
        ),
        migrations.RenameField(
            model_name='storypin',
            old_name='start_time',
            new_name='startTime',
        ),
    ]
