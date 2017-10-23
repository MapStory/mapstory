# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='organizationurl',
            name='org',
        ),
        migrations.AddField(
            model_name='organization',
            name='url0',
            field=models.ForeignKey(related_name='url0', blank=True, to='organizations.OrganizationURL', null=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='url1',
            field=models.ForeignKey(related_name='url1', blank=True, to='organizations.OrganizationURL', null=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='url2',
            field=models.ForeignKey(related_name='url2', blank=True, to='organizations.OrganizationURL', null=True),
        ),
        migrations.AlterField(
            model_name='organizationurl',
            name='url',
            field=models.URLField(max_length=255),
        ),
    ]
