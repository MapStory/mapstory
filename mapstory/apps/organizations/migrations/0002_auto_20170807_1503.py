# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('organizations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrganizationMembership',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('member_since', models.DateTimeField(auto_now=True)),
                ('is_admin', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='OrganizationURL',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('url', models.CharField(max_length=255)),
            ],
        ),
        migrations.RemoveField(
            model_name='organization',
            name='admin_user',
        ),
        migrations.RemoveField(
            model_name='organization',
            name='members',
        ),
        migrations.AddField(
            model_name='organizationurl',
            name='org',
            field=models.ForeignKey(to='organizations.Organization'),
        ),
        migrations.AddField(
            model_name='organizationmembership',
            name='organization',
            field=models.ForeignKey(to='organizations.Organization'),
        ),
        migrations.AddField(
            model_name='organizationmembership',
            name='user',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL),
        ),
    ]
