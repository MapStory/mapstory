# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0003_map_layers_config'),
    ]

    operations = [
        migrations.CreateModel(
            name='StoryFrame',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=100)),
                ('description', models.TextField(null=True, blank=True)),
                ('the_geom', models.TextField(null=True, blank=True)),
                ('start_time', models.BigIntegerField(null=True, blank=True)),
                ('end_time', models.BigIntegerField(null=True, blank=True)),
                ('data', models.TextField(null=True, blank=True)),
                ('center', models.TextField(null=True, blank=True)),
                ('interval', models.IntegerField(null=True, blank=True)),
                ('intervalRate', models.CharField(blank=True, max_length=10, null=True, choices=[(b'minutes', b'Minutes'), (b'hours', b'Hours'), (b'weeks', b'Weeks'), (b'months', b'Months'), (b'years', b'Years')])),
                ('playback', models.IntegerField(null=True, blank=True)),
                ('playbackRate', models.CharField(blank=True, max_length=10, null=True, choices=[(b'seconds', b'Seconds'), (b'minutes', b'Minutes')])),
                ('speed', models.TextField(null=True, blank=True)),
                ('zoom', models.IntegerField(null=True, blank=True)),
                ('layers', models.TextField(null=True, blank=True)),
                ('resolution', models.TextField(null=True, blank=True)),
                ('map', models.ForeignKey(to='mapstories.Map')),
            ],
            options={
                'verbose_name_plural': 'StoryFrames',
            },
        ),
        migrations.CreateModel(
            name='StoryPin',
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
            options={
                'verbose_name_plural': 'StoryPins',
            },
        ),
    ]
