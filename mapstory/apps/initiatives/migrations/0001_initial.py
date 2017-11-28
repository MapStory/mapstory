# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Initiative',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('slug', models.SlugField(max_length=255, null=True, blank=True)),
                ('slogan', models.CharField(max_length=255)),
                ('about', models.TextField(default=b'')),
                ('is_active', models.BooleanField(default=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('city', models.CharField(default=b'', max_length=255)),
                ('country', models.CharField(default=b'', max_length=255)),
                ('image', models.ImageField(null=True, upload_to=b'initiatives', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='InitiativeMembership',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('member_since', models.DateTimeField(auto_now=True)),
                ('is_admin', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('initiative', models.ForeignKey(to='initiatives.Initiative')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Memberships',
            },
        ),
        migrations.CreateModel(
            name='JoinRequest',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('is_open', models.BooleanField(default=True)),
                ('approved_by', models.ForeignKey(blank=True, to='initiatives.InitiativeMembership', null=True)),
                ('initiative', models.ForeignKey(to='initiatives.Initiative')),
                ('user', models.ForeignKey(related_name='initiatives_request', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
