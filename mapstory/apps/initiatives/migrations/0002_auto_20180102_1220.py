# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('initiatives', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='InitiativeSocialMedia',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('icon', models.CharField(max_length=255)),
                ('url', models.URLField()),
            ],
        ),
        migrations.CreateModel(
            name='InitiativeURL',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('url', models.URLField(max_length=255)),
            ],
        ),
        migrations.AddField(
            model_name='initiative',
            name='facebook',
            field=models.ForeignKey(related_name='facebook', blank=True, to='initiatives.InitiativeSocialMedia', null=True),
        ),
        migrations.AddField(
            model_name='initiative',
            name='github',
            field=models.ForeignKey(related_name='github', blank=True, to='initiatives.InitiativeSocialMedia', null=True),
        ),
        migrations.AddField(
            model_name='initiative',
            name='instagram',
            field=models.ForeignKey(related_name='instagram', blank=True, to='initiatives.InitiativeSocialMedia', null=True),
        ),
        migrations.AddField(
            model_name='initiative',
            name='linkedin',
            field=models.ForeignKey(related_name='linkedin', blank=True, to='initiatives.InitiativeSocialMedia', null=True),
        ),
        migrations.AddField(
            model_name='initiative',
            name='twitter',
            field=models.ForeignKey(related_name='twitter', blank=True, to='initiatives.InitiativeSocialMedia', null=True),
        ),
        migrations.AddField(
            model_name='initiative',
            name='url0',
            field=models.ForeignKey(related_name='url0', blank=True, to='initiatives.InitiativeURL', null=True),
        ),
        migrations.AddField(
            model_name='initiative',
            name='url1',
            field=models.ForeignKey(related_name='url1', blank=True, to='initiatives.InitiativeURL', null=True),
        ),
        migrations.AddField(
            model_name='initiative',
            name='url2',
            field=models.ForeignKey(related_name='url2', blank=True, to='initiatives.InitiativeURL', null=True),
        ),
    ]
