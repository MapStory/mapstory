import ast
import datetime
import hashlib
import os
import re

from django import conf, contrib, db, template
from django.contrib.sites.models import Site
from django.conf import settings

import geonode
import textile
from mapstory.mapstories.models import Map, MapStory


class CustomSite(db.models.Model):
    site = db.models.OneToOneField(Site, null=True, related_name='assets', on_delete=db.models.CASCADE)
    subtitle = db.models.CharField(max_length=100)
    logo = db.models.ImageField(blank=False, upload_to='customsite')
    favicon = db.models.ImageField(blank=False, upload_to='customsite')
    footer_text = db.models.TextField()
    analytics_code = db.models.TextField(blank=True)

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
        return '<img src="%s" />' % self.url()
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


class NewsItem(ContentMixin):
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
    example_map = db.models.ForeignKey(Map, null=True, blank=True, on_delete=db.models.CASCADE)
    main_link = db.models.URLField(blank=False)
    external_link = db.models.URLField(blank=True)
    external_link_title = db.models.CharField(
        max_length=64, blank=True, null=True)
    page = db.models.ForeignKey(GetPage, related_name='contents', on_delete=db.models.CASCADE)
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
    user = db.models.ForeignKey(conf.settings.AUTH_USER_MODEL, on_delete=db.models.CASCADE)
    content = db.models.TextField()

    def html(self):
        return textile.textile(self.content)


class ParallaxImage(db.models.Model):
    name = db.models.CharField(max_length=64, blank=True)
    image = db.models.ImageField(upload_to='parallax', max_length=255)

    def __unicode__(self):
        return self.image.url


class Baselayer(db.models.Model):
    def __str__(self):
        if self.title:
            return self.title
        elif self.name:
            return self.name
        return str(self.id)

    def to_object(self):
        def string_or_none(field):
            if field:
                return field
            return None

        args = None
        if self.args:
            args = ast.literal_eval(self.args)
        else:
            args = []

        url = self.source_url

        if url:
            pattern = r"\${OGC_SERVER}"
            match = re.search(pattern, url)
            if match:
                url = re.sub(pattern, settings.OGC_SERVER['default']['PUBLIC_LOCATION'], url)

        return {
            "source": {
                "ptype": string_or_none(self.source_ptype),
                "lazy": self.source_lazy,
                "url": string_or_none(url),
                "restUrl": string_or_none(self.source_rest_url),
                "name": string_or_none(self.source_name),
                "hidden": self.source_hidden
            },
            "name": string_or_none(self.name),
            "type": string_or_none(self.type),
            "args": args,
            "title": string_or_none(self.title),
            "visibility": self.visibility,
            "fixed": self.fixed,
            "group": string_or_none(self.group),
            "isVirtualService": self.is_virtual_service,
            "alwaysAnonymous": self.always_anonymous,
            "proj": string_or_none(self.proj),
            "opacity": float(self.opacity)
        }

    name = db.models.TextField(blank=True)
    type = db.models.TextField(blank=True)
    # This is a json array
    args = db.models.TextField(blank=True)
    title = db.models.TextField(blank=True)
    visibility = db.models.BooleanField(default=True)
    fixed = db.models.BooleanField(default=False)
    group = db.models.TextField(blank=True)

    # Layer Source related things:
    source_ptype = db.models.TextField(blank=False)
    source_lazy = db.models.BooleanField(default=False)
    source_url = db.models.TextField(blank=True)
    source_rest_url = db.models.TextField(blank=True)
    source_name = db.models.TextField(blank=True)
    source_hidden = db.models.BooleanField(default=False)
    # Frontend
    is_virtual_service = db.models.BooleanField(default=False)
    always_anonymous = db.models.BooleanField(default=False)
    proj = db.models.TextField(blank=True)

    # these are things needed on the frontend:
    opacity = db.models.DecimalField(default=1, max_digits=3, decimal_places=2)


class BaselayerDefault(db.models.Model):
    def __str__(self):
        return self.layer.name

    layer = db.models.OneToOneField(Baselayer, on_delete=db.models.CASCADE, primary_key=False)

def get_images():
    return ParallaxImage.objects.all()


def get_sponsors():
    return Sponsor.objects.filter(order__gte=0)


db.models.signals.post_save.connect(
    geonode.base.models.resourcebase_post_save, sender=MapStory)
