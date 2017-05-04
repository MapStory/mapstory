# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('groups', '24_initial'),
        ('base', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='Collection',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=128)),
                ('slug', models.SlugField(unique=True, max_length=128)),
                ('group', models.ForeignKey(related_name='group_collections', to='groups.GroupProfile')),
                ('resources', models.ManyToManyField(related_name='resource_collections', null=True, to='base.ResourceBase', blank=True)),
            ],
        ),
    ]
