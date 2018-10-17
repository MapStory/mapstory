# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FlaggedContent',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('object_id', models.PositiveIntegerField()),
                ('status', models.CharField(default=b'1', max_length=1, choices=[(b'1', 'flagged'), (b'2', 'flag rejected by moderator'), (b'3', 'creator notified'), (b'4', 'content removed by creator'), (b'5', 'content removed by moderator')])),
                ('count', models.PositiveIntegerField(default=1)),
                ('content_type', models.ForeignKey(to='contenttypes.ContentType')),
                ('creator', models.ForeignKey(related_name='flagged_content', to=settings.AUTH_USER_MODEL)),
                ('moderator', models.ForeignKey(related_name='moderated_content', to=settings.AUTH_USER_MODEL, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='FlagInstance',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('when_added', models.DateTimeField(default=datetime.datetime.now)),
                ('when_recalled', models.DateTimeField(null=True)),
                ('comment', models.TextField()),
                ('flag_type', models.CharField(max_length=32, null=True, blank=True)),
                ('flagged_content', models.ForeignKey(to='flag.FlaggedContent')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='flaggedcontent',
            unique_together=set([('content_type', 'object_id')]),
        ),
    ]
