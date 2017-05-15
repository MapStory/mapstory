import datetime
import hashlib
import notifications
import os
import search

from django import conf, db, contrib, template
from django.contrib.sites.models import Site

import geonode
import textile

from mapstory.mapstories.models import MapStory, Map


notifications.set_mapstory_notifications()


class CustomSite(db.models.Model):
    site = db.models.OneToOneField(Site, null=True, related_name='assets')
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
        Site.objects.clear_cache()


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
    example_map = db.models.ForeignKey(Map, null=True, blank=True)
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

db.models.signals.post_save.connect(mapstory_profile_post_save, sender=geonode.people.models.Profile)
db.models.signals.post_save.connect(geonode.base.models.resourcebase_post_save, sender=MapStory)
db.models.signals.post_save.connect(mapstory_map_post_save, sender=Map)
