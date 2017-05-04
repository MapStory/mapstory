# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='JournalEntry',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('content', models.TextField(help_text=b"use <a href=http://redcloth.org/hobix.com/textile/ target='_'>textile</a> for the content")),
                ('date', models.DateTimeField(default=datetime.datetime.now)),
                ('publish', models.BooleanField(default=False)),
                ('title', models.CharField(max_length=255)),
                ('show_on_main', models.BooleanField(default=False)),
                ('author', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'JournalEntries',
            },
        ),
    ]
