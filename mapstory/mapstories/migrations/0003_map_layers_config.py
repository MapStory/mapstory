# -*- coding: utf-8 -*-


from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstories', '0002_mapstory_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='map',
            name='layers_config',
            field=models.TextField(null=True, blank=True),
        ),
    ]
