# -*- coding: utf-8 -*-


from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mapstory', '0003_baselayer_defaultbaselayer'),
    ]

    operations = [
        migrations.CreateModel(
            name='BaselayerDefault',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('layer', models.OneToOneField(to='mapstory.Baselayer', on_delete=models.CASCADE)),
            ],
        ),
        migrations.RemoveField(
            model_name='defaultbaselayer',
            name='layer',
        ),
        migrations.DeleteModel(
            name='DefaultBaselayer',
        ),
    ]
