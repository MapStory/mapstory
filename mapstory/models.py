import datetime
import hashlib
import json
import os
import uuid

import geonode
import guardian
import textile
from django import conf, db, contrib, template

import notifications, search
from apps.journal import models

from maps.models import MapStory


notifications.set_mapstory_notifications()


class CustomSite(db.models.Model):
    site = db.models.OneToOneField(contrib.sites.models.Site, null=True, related_name='assets')
    subtitle = db.models.CharField(max_length=100)
    logo = db.models.ImageField(blank=False, upload_to='customsite')
    favicon = db.models.ImageField(blank=False, upload_to='customsite')
    footer_text = db.models.TextField()

    class Meta:
        verbose_name = "Custom Site Property"
        verbose_name_plural = "Custom Site Properties"

    def __unicode__(self):
        return 'Properties of {0}'.format(self.site.domain)

    def save(self, *args, **kwargs):
        super(CustomSite, self).save(*args, **kwargs)
        # Cached information will likely be incorrect now.
        contrib.sites.models.Site.objects.clear_cache()


def _stamp(data):
    s = hashlib.sha1()
    s.update(data)
    return s.hexdigest()[0:8]


class Sponsor(db.models.Model):
    name = db.models.CharField(max_length=64)
    link = db.models.URLField(blank=False)
    icon = db.models.ImageField(blank=False, upload_to='sponsors')
    description = db.models.TextField(blank=True)
    order = db.models.IntegerField(blank=True, default=0)
    stamp = db.models.CharField(max_length=8, blank=True)

    def url(self):
        return self.icon.url + "?" + self.stamp

    def save(self, *args, **kwargs):
        if self.icon.name:
            self.stamp = _stamp(self.icon.read())
        super(Sponsor, self).save(*args, **kwargs)

    def __unicode__(self):
        return 'Sponsor - %s' % self.name

    class Meta:
        ordering = ['order']

    def image_tag(self):
        return u'<img src="%s" />' % self.url()
    image_tag.short_description = 'Image'
    image_tag.allow_tags = True


class ContentMixin(db.models.Model):
    content = db.models.TextField(
        help_text="use <a href=%s target='_'>textile</a> for the content" %
        'http://redcloth.org/hobix.com/textile/'
    )
    date = db.models.DateTimeField(default=datetime.datetime.now)
    publish = db.models.BooleanField(default=False)

    def html(self):
        return textile.textile(self.content)

    class Meta:
        abstract = True
        ordering = ['-date']


class Community(db.models.Model):
    name = db.models.CharField(max_length=64, unique=True)
    icon = db.models.ImageField(blank=False, upload_to='communities')
    description = db.models.TextField(blank=True)
    order = db.models.IntegerField(blank=True, default=0)
    stamp = db.models.CharField(max_length=8, blank=True)
    slug = db.models.SlugField(max_length=64, unique=True, blank=True)
    layer = db.models.ManyToManyField(geonode.layers.models.Layer, blank=True)
    leads = db.models.ManyToManyField(geonode.people.models.Profile, blank=True)
    journals = db.models.ManyToManyField(models.JournalEntry, blank=True)

    def url(self):
        return self.icon.url + "?" + self.stamp

    def save(self, *args, **kwargs):
        if self.icon.name:
            self.stamp = _stamp(self.icon.read())
        super(Community, self).save(*args, **kwargs)

    def __unicode__(self):
        return 'Community - %s' % self.name

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'communities'

    def image_tag(self):
        return u'<img src="%s" />' % self.url()
    image_tag.short_description = 'Image'
    image_tag.allow_tags = True


class Task(db.models.Model):
    task = db.models.TextField(blank=True)
    community = db.models.ForeignKey(Community, related_name='tasks')


def name_post_save(instance, *args, **kwargs):
    Community.objects.filter(name=instance.name).update(slug=(template.defaultfilters.slugify(instance.name)))


class NewsItem(ContentMixin ):
    title = db.models.CharField(max_length=64)

    @property
    def publication_time(self):
        return self.date


class GetPage(db.models.Model):
    name = db.models.SlugField(max_length=32, unique=True,
                            help_text='Do NOT include the "get" prefix')
    title = db.models.CharField(max_length=32)
    subtitle = db.models.CharField(max_length=32, blank=True)

    def published_entries(self):
        return self.contents.filter(publish=True)

    def __unicode__(self):
        return 'GetPage: %s' % self.name


class GetPageContent(ContentMixin):
    title = db.models.CharField(max_length=64)
    subtitle = db.models.CharField(max_length=64, blank=True)
    example_map = db.models.ForeignKey(geonode.maps.models.Map, null=True, blank=True)
    main_link = db.models.URLField(blank=False)
    external_link = db.models.URLField(blank=True)
    external_link_title = db.models.CharField(max_length=64, blank=True, null=True)
    page = db.models.ForeignKey(GetPage, related_name='contents')
    order = db.models.IntegerField(blank=True, default=0)
    video = db.models.FileField(upload_to='getpage', blank=True)
    video_embed_link = db.models.URLField(blank=True)

    def extension(self):
        if self.video.name is None:
            return 'mp4'
        name, extension = os.path.splitext(self.video.name)
        return extension[1:]

    class Meta:
        ordering = ['order']


class Leader(db.models.Model):
    user = db.models.ForeignKey(conf.settings.AUTH_USER_MODEL)
    content = db.models.TextField()

    def html(self):
        return textile.textile(self.content)


class ParallaxImage(db.models.Model):
    name = db.models.CharField(max_length=64, blank=True)
    image = db.models.ImageField(upload_to='parallax', max_length=255)

    def __unicode__(self):
        return self.image.url


def get_images():
    return ParallaxImage.objects.all()


def get_sponsors():
    return Sponsor.objects.filter(order__gte=0)


def get_featured_groups():
    return geonode.people.models.GroupProfile.objects.filter(featured=True)


def get_group_layers(gProfile):
    users = gProfile.group.user_set.all()
    layers = []
    for user in users:
        layers.append(guardian.shortcuts.get_objects_for_user(user, 'base.view_resourcebase').instance_of(geonode.layers.models.Layer))

    return [item for sublist in layers for item in sublist]


def get_group_maps(gProfile):
    users = gProfile.group.user_set.all()
    maps = []
    for user in users:
        maps.append(guardian.shortcuts.get_objects_for_user(user, 'base.view_resourcebase').instance_of(geonode.maps.models.Map))

    return [item for sublist in maps for item in sublist]


def mapstory_profile_post_save(instance, sender, **kwargs):
    geonode.people.models.profile_post_save(instance, sender, **kwargs)
    registered_group, created = contrib.auth.models.Group.objects.get_or_create(name='registered')
    instance.groups.add(registered_group)
    geonode.people.models.Profile.objects.filter(id=instance.id).update()

def mapstory_map_post_save(instance, sender, **kwargs):
    # Call basic post save map functionality from geonode
    geonode.geoserver.signals.geoserver_post_save_map(instance, sender, **kwargs)

    # Assuming map thumbnail was created successfully, updating Story object here
    if instance.chapter_index == 0:
        instance.story.update_thumbnail(instance)

    try:
        search.utils.update_es_index(MapStory, MapStory.objects.get(id=instance.story.id))
    except:
        pass

db.models.signals.post_save.connect(name_post_save, sender=Community)
db.models.signals.post_save.connect(mapstory_profile_post_save, sender=geonode.people.models.Profile)
db.models.signals.post_save.connect(geonode.base.models.resourcebase_post_save, sender=MapStory)
db.models.signals.post_save.connect(mapstory_map_post_save, sender=geonode.maps.models.Map)

