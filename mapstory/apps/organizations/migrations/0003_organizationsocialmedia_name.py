# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0002_auto_20170821_1858'),
    ]

    operations = [
        migrations.AddField(
            model_name='organizationsocialmedia',
            name='name',
            field=models.CharField(default=b'blank', max_length=255),
        ),
    ]
