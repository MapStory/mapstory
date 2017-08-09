# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0002_organizationlayer_organizationmapstory'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='organizationmembership',
            options={'verbose_name_plural': 'Memberships'},
        ),
    ]
