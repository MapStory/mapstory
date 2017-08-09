# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0003_auto_20170808_2050'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrganizationSocialMedia',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('icon', models.CharField(max_length=255)),
                ('url', models.URLField()),
            ],
        ),
        migrations.AddField(
            model_name='organization',
            name='about',
            field=models.TextField(default=b''),
        ),
        migrations.AddField(
            model_name='organization',
            name='slogan',
            field=models.CharField(default=b'', max_length=255),
        ),
        migrations.AddField(
            model_name='organizationsocialmedia',
            name='organization',
            field=models.ForeignKey(to='organizations.Organization'),
        ),
    ]
