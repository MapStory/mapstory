# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0002_mapstory_slug'),
        ('layers', '24_to_26'),
        ('initiatives', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='InitiativeLayer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('initiative', models.ForeignKey(to='initiatives.Initiative')),
                ('layer', models.ForeignKey(to='layers.Layer')),
                ('membership', models.ForeignKey(to='initiatives.InitiativeMembership')),
            ],
        ),
        migrations.CreateModel(
            name='InitiativeMapStory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('initiative', models.ForeignKey(to='initiatives.Initiative')),
                ('mapstory', models.ForeignKey(to='mapstories.MapStory')),
                ('membership', models.ForeignKey(to='initiatives.InitiativeMembership')),
            ],
        ),
    ]
