# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstory', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customsite',
            name='analytics_code',
            field=models.TextField(blank=True),
        ),
    ]
