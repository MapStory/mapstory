# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0001_initial'),
        ('layers', '24_to_26'),
        ('organizations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrganizationLayer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('layer', models.ForeignKey(to='layers.Layer')),
                ('membership', models.ForeignKey(to='organizations.OrganizationMembership')),
                ('organization', models.ForeignKey(to='organizations.Organization')),
            ],
        ),
        migrations.CreateModel(
            name='OrganizationMapStory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('mapstory', models.ForeignKey(to='mapstories.MapStory')),
                ('membership', models.ForeignKey(to='organizations.OrganizationMembership')),
                ('organization', models.ForeignKey(to='organizations.Organization')),
            ],
        ),
    ]
