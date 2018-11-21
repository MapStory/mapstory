# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstory', '0002_customsite_analytics_code'),
    ]

    operations = [
        migrations.CreateModel(
            name='Baselayer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.TextField(blank=True)),
                ('type', models.TextField(blank=True)),
                ('args', models.TextField(blank=True)),
                ('title', models.TextField(blank=True)),
                ('visibility', models.BooleanField(default=True)),
                ('fixed', models.BooleanField(default=False)),
                ('group', models.TextField(blank=True)),
                ('source_ptype', models.TextField()),
                ('source_lazy', models.BooleanField(default=False)),
                ('source_url', models.TextField(blank=True)),
                ('source_rest_url', models.TextField(blank=True)),
                ('source_name', models.TextField(blank=True)),
                ('source_hidden', models.BooleanField(default=False)),
                ('is_virtual_service', models.BooleanField(default=False)),
                ('always_anonymous', models.BooleanField(default=False)),
                ('proj', models.TextField(blank=True)),
                ('opacity', models.DecimalField(default=1, max_digits=3, decimal_places=2)),
            ],
        ),
        migrations.CreateModel(
            name='DefaultBaselayer',
            fields=[
                ('name', models.OneToOneField(primary_key=True, serialize=False, to='mapstory.Baselayer')),
            ],
        ),
    ]
