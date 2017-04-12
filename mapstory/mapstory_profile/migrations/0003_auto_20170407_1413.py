# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstory_profile', '0002_auto_20170323_1811'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mapstoryprofile',
            name='social_facebook',
            field=models.CharField(help_text="Provide your Facebook username. From your profile page, this is what comes after 'facebook.com/' in the URL.", max_length=255, null=True, verbose_name='Facebook Profile', blank=True),
        ),
        migrations.AlterField(
            model_name='mapstoryprofile',
            name='social_github',
            field=models.CharField(help_text="Provide your Github username, e.g. 'mapstory'.", max_length=255, null=True, verbose_name='GitHub Profile', blank=True),
        ),
        migrations.AlterField(
            model_name='mapstoryprofile',
            name='social_linkedin',
            field=models.CharField(help_text="Provide your LinkedIn username. From your profile page, this is what comes after 'linkedin.com/in/' in the URL", max_length=255, null=True, verbose_name='LinkedIn Profile', blank=True),
        ),
        migrations.AlterField(
            model_name='mapstoryprofile',
            name='social_twitter',
            field=models.CharField(help_text="Provide your Twitter username, e.g. 'mapstory'.", max_length=255, null=True, verbose_name='Twitter Handle', blank=True),
        ),
    ]
