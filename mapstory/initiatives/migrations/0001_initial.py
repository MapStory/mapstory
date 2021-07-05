# -*- coding: utf-8 -*-


from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('teams', '0001_initial'),
        ('mapstories', '0002_mapstory_slug'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('layers', '24_to_26'),
    ]

    operations = [
        migrations.CreateModel(
            name='Initiative',
            fields=[
                ('team_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='teams.Team', on_delete=models.CASCADE)),
                ('slug', models.SlugField(max_length=255, null=True, blank=True)),
                ('image', models.ImageField(null=True, upload_to=b'initiatives', blank=True)),
            ],
            bases=('teams.team',),
        ),
        migrations.CreateModel(
            name='InitiativeLayer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('initiative', models.ForeignKey(to='initiatives.Initiative', on_delete=models.CASCADE)),
                ('layer', models.ForeignKey(to='layers.Layer', on_delete=models.CASCADE)),
            ],
        ),
        migrations.CreateModel(
            name='InitiativeMapStory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('initiative', models.ForeignKey(to='initiatives.Initiative', on_delete=models.CASCADE)),
                ('mapstory', models.ForeignKey(to='mapstories.MapStory', on_delete=models.CASCADE)),
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
                ('initiative', models.ForeignKey(to='initiatives.Initiative', on_delete=models.CASCADE)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE)),
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
                ('approved_by', models.ForeignKey(blank=True, to='initiatives.InitiativeMembership', null=True, on_delete=models.CASCADE)),
                ('initiative', models.ForeignKey(to='initiatives.Initiative', on_delete=models.CASCADE)),
                ('user', models.ForeignKey(related_name='initiatives_request', to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE)),
            ],
        ),
        migrations.AddField(
            model_name='initiativemapstory',
            name='membership',
            field=models.ForeignKey(to='initiatives.InitiativeMembership', on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='initiativelayer',
            name='membership',
            field=models.ForeignKey(to='initiatives.InitiativeMembership', on_delete=models.CASCADE),
        ),
    ]
