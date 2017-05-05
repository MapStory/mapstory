# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0001_initial'),
        ('sites', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('layers', '24_to_26'),
        ('journal', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomSite',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('subtitle', models.CharField(max_length=100)),
                ('logo', models.ImageField(upload_to=b'customsite')),
                ('favicon', models.ImageField(upload_to=b'customsite')),
                ('footer_text', models.TextField()),
                ('site', models.OneToOneField(related_name='assets', null=True, to='sites.Site')),
            ],
            options={
                'verbose_name': 'Custom Site Property',
                'verbose_name_plural': 'Custom Site Properties',
            },
        ),
        migrations.CreateModel(
            name='GetPage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.SlugField(help_text=b'Do NOT include the "get" prefix', unique=True, max_length=32)),
                ('title', models.CharField(max_length=32)),
                ('subtitle', models.CharField(max_length=32, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='GetPageContent',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('content', models.TextField(help_text=b"use <a href=http://redcloth.org/hobix.com/textile/ target='_'>textile</a> for the content")),
                ('date', models.DateTimeField(default=datetime.datetime.now)),
                ('publish', models.BooleanField(default=False)),
                ('title', models.CharField(max_length=64)),
                ('subtitle', models.CharField(max_length=64, blank=True)),
                ('main_link', models.URLField()),
                ('external_link', models.URLField(blank=True)),
                ('external_link_title', models.CharField(max_length=64, null=True, blank=True)),
                ('order', models.IntegerField(default=0, blank=True)),
                ('video', models.FileField(upload_to=b'getpage', blank=True)),
                ('video_embed_link', models.URLField(blank=True)),
                ('example_map', models.ForeignKey(blank=True, to='mapstories.Map', null=True)),
                ('page', models.ForeignKey(related_name='contents', to='mapstory.GetPage')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='Leader',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('content', models.TextField()),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='NewsItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('content', models.TextField(help_text=b"use <a href=http://redcloth.org/hobix.com/textile/ target='_'>textile</a> for the content")),
                ('date', models.DateTimeField(default=datetime.datetime.now)),
                ('publish', models.BooleanField(default=False)),
                ('title', models.CharField(max_length=64)),
            ],
            options={
                'ordering': ['-date'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ParallaxImage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=64, blank=True)),
                ('image', models.ImageField(max_length=255, upload_to=b'parallax')),
            ],
        ),
        migrations.CreateModel(
            name='Sponsor',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=64)),
                ('link', models.URLField()),
                ('icon', models.ImageField(upload_to=b'sponsors')),
                ('description', models.TextField(blank=True)),
                ('order', models.IntegerField(default=0, blank=True)),
                ('stamp', models.CharField(max_length=8, blank=True)),
            ],
            options={
                'ordering': ['order'],
            },
        ),
    ]
