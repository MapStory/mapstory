# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0002_mapstory_slug'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('layers', '24_to_26'),
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=255)),
                ('slogan', models.CharField(default=b'', max_length=255)),
                ('about', models.TextField(default=b'')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Organizations',
            },
        ),
        migrations.CreateModel(
            name='OrganizationLayer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('layer', models.ForeignKey(to='layers.Layer')),
            ],
        ),
        migrations.CreateModel(
            name='OrganizationMapStory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('mapstory', models.ForeignKey(to='mapstories.MapStory')),
            ],
        ),
        migrations.CreateModel(
            name='OrganizationMembership',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('member_since', models.DateTimeField(auto_now=True)),
                ('is_admin', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('organization', models.ForeignKey(to='organizations.Organization')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Memberships',
            },
        ),
        migrations.CreateModel(
            name='OrganizationSocialMedia',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('icon', models.CharField(max_length=255)),
                ('url', models.URLField()),
                ('organization', models.ForeignKey(to='organizations.Organization')),
            ],
        ),
        migrations.CreateModel(
            name='OrganizationURL',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('url', models.CharField(max_length=255)),
                ('org', models.ForeignKey(to='organizations.Organization')),
            ],
        ),
        migrations.AddField(
            model_name='organizationmapstory',
            name='membership',
            field=models.ForeignKey(to='organizations.OrganizationMembership'),
        ),
        migrations.AddField(
            model_name='organizationmapstory',
            name='organization',
            field=models.ForeignKey(to='organizations.Organization'),
        ),
        migrations.AddField(
            model_name='organizationlayer',
            name='membership',
            field=models.ForeignKey(to='organizations.OrganizationMembership'),
        ),
        migrations.AddField(
            model_name='organizationlayer',
            name='organization',
            field=models.ForeignKey(to='organizations.Organization'),
        ),
    ]
