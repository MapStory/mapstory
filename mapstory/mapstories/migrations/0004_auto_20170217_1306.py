# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0004_auto_20170217_1306'),
        ('mapstories', '0003_map_viewer_playbackmode'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='maplayer',
            name='map',
        ),
        migrations.RemoveField(
            model_name='mapsnapshot',
            name='map',
        ),
        migrations.RemoveField(
            model_name='mapsnapshot',
            name='user',
        ),
        migrations.AlterModelOptions(
            name='map',
            options={},
        ),
        migrations.RemoveField(
            model_name='map',
            name='abstract_en',
        ),
        migrations.RemoveField(
            model_name='map',
            name='center_x',
        ),
        migrations.RemoveField(
            model_name='map',
            name='center_y',
        ),
        migrations.RemoveField(
            model_name='map',
            name='constraints_other_en',
        ),
        migrations.RemoveField(
            model_name='map',
            name='data_quality_statement_en',
        ),
        migrations.RemoveField(
            model_name='map',
            name='featuredurl',
        ),
        migrations.RemoveField(
            model_name='map',
            name='last_modified',
        ),
        migrations.RemoveField(
            model_name='map',
            name='projection',
        ),
        migrations.RemoveField(
            model_name='map',
            name='purpose_en',
        ),
        migrations.RemoveField(
            model_name='map',
            name='resourcebase_ptr',
        ),
        migrations.RemoveField(
            model_name='map',
            name='supplemental_information_en',
        ),
        migrations.RemoveField(
            model_name='map',
            name='title_en',
        ),
        migrations.RemoveField(
            model_name='map',
            name='urlsuffix',
        ),
        migrations.RemoveField(
            model_name='map',
            name='viewer_playbackmode',
        ),
        migrations.RemoveField(
            model_name='map',
            name='zoom',
        ),
        migrations.AddField(
            model_name='map',
            name='map_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, default=None, serialize=False, to='maps.Map'),
            preserve_default=False,
        ),
        migrations.AlterModelTable(
            name='mapstory',
            table='maps_mapstory',
        ),
        migrations.DeleteModel(
            name='MapLayer',
        ),
        migrations.DeleteModel(
            name='MapSnapshot',
        ),
    ]
