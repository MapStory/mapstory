# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0005_auto_20180928_1218'),
    ]

    operations = [
        migrations.CreateModel(
            name='LayerStyle',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('style_id', models.TextField()),
                ('style', models.TextField()),
                ('map_story', models.ForeignKey(to='mapstories.MapStory')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='layerstyle',
            unique_together=set([('style_id', 'map_story')]),
        ),
    ]
