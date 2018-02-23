# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Annotation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.TextField()),
                ('content', models.TextField(null=True, blank=True)),
                ('media', models.TextField(null=True, blank=True)),
                ('the_geom', models.TextField(null=True, blank=True)),
                ('start_time', models.BigIntegerField(null=True, blank=True)),
                ('end_time', models.BigIntegerField(null=True, blank=True)),
                ('in_timeline', models.BooleanField(default=False)),
                ('in_map', models.BooleanField(default=False)),
                ('appearance', models.TextField(null=True, blank=True)),
                ('auto_show', models.BooleanField(default=False)),
                ('pause_playback', models.BooleanField(default=False)),
                ('map', models.ForeignKey(to='mapstories.Map')),
            ],
        ),
    ]
