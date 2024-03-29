# -*- coding: utf-8 -*-


from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('teams', '0001_initial'),
        ('mapstories', '0002_mapstory_slug'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('layers', '24_to_26'),
    ]

    operations = [
        migrations.CreateModel(
            name='JoinRequest',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('is_open', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('team_ptr',
                 models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False,
                                      to='teams.Team', on_delete=models.CASCADE)),
                ('image', models.ImageField(null=True, upload_to=b'org_profiles', blank=True)),
                ('slug', models.SlugField(max_length=255, unique=True, null=True, blank=True)),
            ],
            options={
                'verbose_name_plural': 'Organizations',
            },
            bases=('teams.team',),
        ),
        migrations.CreateModel(
            name='OrganizationLayer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('layer', models.ForeignKey(to='layers.Layer', on_delete=models.CASCADE)),
            ],
        ),
        migrations.CreateModel(
            name='OrganizationMapStory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('mapstory', models.ForeignKey(to='mapstories.MapStory', on_delete=models.CASCADE)),
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
                ('organization', models.ForeignKey(to='organizations.Organization', on_delete=models.CASCADE)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE)),
            ],
            options={
                'verbose_name_plural': 'Memberships',
            },
        ),
        migrations.CreateModel(
            name='OrganizationSocialMedia',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('icon', models.CharField(max_length=255)),
                ('url', models.URLField()),
            ],
        ),
        migrations.CreateModel(
            name='OrganizationURL',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('url', models.URLField(max_length=255)),
            ],
        ),
        migrations.AddField(
            model_name='organizationmapstory',
            name='membership',
            field=models.ForeignKey(to='organizations.OrganizationMembership', on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organizationmapstory',
            name='organization',
            field=models.ForeignKey(to='organizations.Organization', on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organizationlayer',
            name='membership',
            field=models.ForeignKey(to='organizations.OrganizationMembership', on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organizationlayer',
            name='organization',
            field=models.ForeignKey(to='organizations.Organization', on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organization',
            name='facebook',
            field=models.ForeignKey(related_name='facebook', blank=True, to='organizations.OrganizationSocialMedia',
                                    null=True, on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organization',
            name='github',
            field=models.ForeignKey(related_name='github', blank=True, to='organizations.OrganizationSocialMedia',
                                    null=True, on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organization',
            name='instagram',
            field=models.ForeignKey(related_name='instagram', blank=True, to='organizations.OrganizationSocialMedia',
                                    null=True, on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organization',
            name='linkedin',
            field=models.ForeignKey(related_name='linkedin', blank=True, to='organizations.OrganizationSocialMedia',
                                    null=True, on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organization',
            name='twitter',
            field=models.ForeignKey(related_name='twitter', blank=True, to='organizations.OrganizationSocialMedia',
                                    null=True, on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organization',
            name='url0',
            field=models.ForeignKey(related_name='url0', blank=True, to='organizations.OrganizationURL', null=True,
                                    on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organization',
            name='url1',
            field=models.ForeignKey(related_name='url1', blank=True, to='organizations.OrganizationURL', null=True,
                                    on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='organization',
            name='url2',
            field=models.ForeignKey(related_name='url2', blank=True, to='organizations.OrganizationURL', null=True,
                                    on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='joinrequest',
            name='approved_by',
            field=models.ForeignKey(blank=True, to='organizations.OrganizationMembership', null=True,
                                    on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='joinrequest',
            name='organization',
            field=models.ForeignKey(to='organizations.Organization', on_delete=models.CASCADE),
        ),
        migrations.AddField(
            model_name='joinrequest',
            name='user',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE),
        ),
    ]
