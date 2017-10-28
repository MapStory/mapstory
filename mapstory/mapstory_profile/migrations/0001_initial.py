# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('taggit', '0002_auto_20150616_2121'),
    ]

    operations = [
        migrations.CreateModel(
            name='MapstoryProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('Volunteer_Technical_Community', models.BooleanField(default=False, help_text='indicates membership of the Volunteer Technical Comunity', verbose_name='Volunteer Technical Community')),
                ('social_twitter', models.CharField(help_text='Provide your Twitter username', max_length=255, null=True, verbose_name='Twitter Handle', blank=True)),
                ('social_facebook', models.CharField(help_text='Provide your Facebook username', max_length=255, null=True, verbose_name='Facebook Profile', blank=True)),
                ('social_github', models.CharField(help_text='Provide your GitHub username', max_length=255, null=True, verbose_name='GitHub Profile', blank=True)),
                ('social_linkedin', models.CharField(help_text='Provide your LinkedIn username', max_length=255, null=True, verbose_name='LinkedIn Profile', blank=True)),
                ('education', models.TextField(help_text='Provide some details about your Education and Background', null=True, verbose_name='Education', blank=True)),
                ('expertise', models.TextField(help_text='Provide some details about your Expertise', null=True, verbose_name='Expertise', blank=True)),
                ('digest', models.BooleanField(default=False, help_text='Subscribe to MapStory monthly email digest', verbose_name='Monthly email digest')),
                ('avatar_100', models.CharField(max_length=512, null=True, blank=True)),
                ('user_profile', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
                ('interests', taggit.managers.TaggableManager(to='taggit.Tag', through='taggit.TaggedItem', blank=True, help_text='A list of personal interests (separate each interest with a comma)', verbose_name='interests')),
            ],
        ),
    ]
