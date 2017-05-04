# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '__first__'),
        ('maps', '24_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Map',
            fields=[
                ('map_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='maps.Map')),
                ('chapter_index', models.IntegerField(null=True, verbose_name='chapter index', blank=True)),
                ('viewer_playbackmode', models.CharField(max_length=32, null=True, verbose_name='Viewer Playback', blank=True)),
            ],
            options={
                'abstract': False,
            },
            bases=('maps.map',),
        ),
        migrations.CreateModel(
            name='MapStory',
            fields=[
                ('resourcebase_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='base.ResourceBase')),
                ('distribution_url', models.TextField(help_text='information about on-line sources from which the dataset, specification, or community profile name and extended metadata elements can be obtained', null=True, verbose_name='distribution URL', blank=True)),
                ('distribution_description', models.TextField(help_text='detailed text description of what the online resource is/does', null=True, verbose_name='distribution description', blank=True)),
            ],
            options={
                'abstract': False,
                'db_table': 'maps_mapstory',
                'verbose_name_plural': 'MapStories',
            },
            bases=('base.resourcebase',),
        ),
        migrations.AddField(
            model_name='map',
            name='story',
            field=models.ForeignKey(related_name='chapter_list', blank=True, to='mapstories.MapStory', null=True),
        ),
    ]
