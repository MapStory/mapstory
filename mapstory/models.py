from django.conf import settings
from django.db import models
from datetime import datetime
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


class DiaryEntry(ContentMixin):
    title = models.CharField(max_length=32)
    author = models.ForeignKey(settings.AUTH_USER_MODEL)


def get_sponsors():
    return Sponsor.objects.filter(order__gte=0)
