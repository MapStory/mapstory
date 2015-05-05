from django.conf import settings
from django.core.urlresolvers import reverse
from django.db import models
from datetime import datetime
from geonode.maps.models import Map
import hashlib
import textile


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
    content = models.TextField()
    date = models.DateTimeField(default=datetime.now)
    publish = models.BooleanField(default=False)

    def html(self):
        return textile.textile(self.content)

    class Meta:
        abstract = True
        ordering = ['-date']


class NewsItem(ContentMixin ):
    title = models.CharField(max_length=64)

    @property
    def publication_time(self):
        return self.date


class DiaryEntry(ContentMixin):
    title = models.CharField(max_length=32)
    author = models.ForeignKey(settings.AUTH_USER_MODEL)

    def get_absolute_url(self):
        return reverse('diary-detail', args=[self.pk])


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
    page = models.ForeignKey(GetPage, related_name='contents')
    order = models.IntegerField(blank=True, default=0)

    class Meta:
        ordering = ['order']


class Leader(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    content = models.TextField()

    def html(self):
        return textile.textile(self.content)


def get_sponsors():
    return Sponsor.objects.filter(order__gte=0)
