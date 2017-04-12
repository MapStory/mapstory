# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstory_profile', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='mapstoryprofile',
            old_name='user_profile',
            new_name='user',
        ),
    ]
