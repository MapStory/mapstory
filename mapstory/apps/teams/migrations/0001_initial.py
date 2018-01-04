# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255)),
                ('slogan', models.CharField(default=b'', max_length=255)),
                ('about', models.TextField(default=b'')),
                ('is_active', models.BooleanField(default=True)),
                ('city', models.CharField(default=b'', max_length=255)),
                ('country', models.CharField(default=b'', max_length=255)),
                ('group_type', models.CharField(default=b'', max_length=255)),
            ],
            options={
                'verbose_name': 'Team',
                'verbose_name_plural': 'Teams',
            },
        ),
    ]
