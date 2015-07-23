from django.conf import settings
from django.core.urlresolvers import reverse
from django.db import models
from datetime import datetime
from geonode.maps.models import Map, MapLayer
import hashlib
import textile
from django.template.defaulttags import register
import os
from django.template.defaultfilters import slugify
from django.db.models import signals
from geonode.people.models import Profile
from geonode.layers.models import Layer

def _stamp(data):
    s = hashlib.sha1()
    s.update(data)
    return s.hexdigest()[0:8]


class Sponsor(models.Model):
    name = models.CharField(max_length=64)
    link = models.URLField(blank=False)
    icon = models.ImageField(blank=False, upload_to='sponsors')
    description = models.TextField(blank=True)
    order = models.IntegerField(blank=True, default=0)
    stamp = models.CharField(max_length=8, blank=True)

    def url(self):
        return self.icon.url + "?" + self.stamp

    def save(self, *args, **kwargs):
        if self.icon.name:
            self.stamp = _stamp(self.icon.read())
        super(Sponsor, self).save(*args, **kwargs)

    def __unicode__(self):
        return 'Sponser - %s' % self.name

    class Meta:
        ordering = ['order']

    def image_tag(self):
        return u'<img src="%s" />' % self.url()
    image_tag.short_description = 'Image'
    image_tag.allow_tags = True

class ContentMixin(models.Model):
    content = models.TextField(
        help_text="use <a href=%s target='_'>textile</a> for the content" %
        'http://redcloth.org/hobix.com/textile/'
    )
    date = models.DateTimeField(default=datetime.now)
    publish = models.BooleanField(default=False)

    def html(self):
        return textile.textile(self.content)

    class Meta:
        abstract = True
        ordering = ['-date']

class DiaryEntry(ContentMixin):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(settings.AUTH_USER_MODEL)
    show_on_main = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s' % (self.title)

    def get_absolute_url(self):
        return reverse('diary-detail', args=[self.pk])

    class Meta:
        verbose_name_plural = 'DiaryEntries'

class Community(models.Model):
    name = models.CharField(max_length=64)
    icon = models.ImageField(blank=False, upload_to='communities')
    description = models.TextField(blank=True)
    order = models.IntegerField(blank=True, default=0)
    stamp = models.CharField(max_length=8, blank=True)
    slug = models.SlugField(max_length=64, unique=True, blank=True)
    layer = models.ManyToManyField(Layer, blank=True)
    leads = models.ManyToManyField(Profile, blank=True)
    journals = models.ManyToManyField(DiaryEntry, blank=True)

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

class Task(models.Model):
    task = models.TextField(blank=True)
    community = models.ForeignKey(Community, related_name='tasks')
    
def name_post_save(instance, *args, **kwargs):
    Community.objects.filter(name=instance.name).update(slug=(slugify(instance.name)))


class NewsItem(ContentMixin ):
    title = models.CharField(max_length=64)

    @property
    def publication_time(self):
        return self.date


class GetPage(models.Model):
    name = models.SlugField(max_length=32, unique=True,
                            help_text='Do NOT include the "get" prefix')
    title = models.CharField(max_length=32)
    subtitle = models.CharField(max_length=32, blank=True)

    def published_entries(self):
        return self.contents.filter(publish=True)

    def __unicode__(self):
        return 'GetPage: %s' % self.name


class GetPageContent(ContentMixin):
    title = models.CharField(max_length=64)
    subtitle = models.CharField(max_length=64, blank=True)
    example_map = models.ForeignKey(Map, null=True, blank=True)
    main_link = models.URLField(blank=False)
    external_link = models.URLField(blank=True)
    external_link_title = models.CharField(max_length=64, blank=True, null=True)
    page = models.ForeignKey(GetPage, related_name='contents')
    order = models.IntegerField(blank=True, default=0)
    video = models.FileField(upload_to='getpage', blank=True)
    video_embed_link = models.URLField(blank=True)

    def extension(self):
        if self.video.name is None:
            return 'mp4'
        name, extension = os.path.splitext(self.video.name)
        return extension[1:]

    class Meta:
        ordering = ['order']


class Leader(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    content = models.TextField()

    def html(self):
        return textile.textile(self.content)

class ParallaxImage(models.Model):
    name = models.CharField(max_length=64, blank=True)
    image = models.ImageField(upload_to='parallax', max_length=255)

    def __unicode__(self):
        return self.image.url

def get_images():
    return ParallaxImage.objects.all()

def get_sponsors():
    return Sponsor.objects.filter(order__gte=0)

def get_communities():
    return Community.objects.filter(order__gte=0)

signals.post_save.connect(name_post_save, sender=Community)