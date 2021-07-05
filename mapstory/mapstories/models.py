import json
import uuid
from datetime import datetime

from django import core, db
from django.conf import settings
from django.db import models
from django.db.models import signals
from django.template.defaultfilters import slugify
from django.utils.translation import ugettext_lazy as _

import geonode
from mapstory import search
from mapstory.mapstories.utils import parse_date_time


class MapStory(geonode.base.models.ResourceBase):

    @property
    def chapters(self):
        return self.chapter_list.order_by('chapter_index')

    @property
    def get_chapter_info(self):
        chapter_list = []
        for chapter in self.chapters:

            storypins = chapter.storypin_set.all()
            storypin_list = []
            for storypin in storypins:
                storypin_dict = {
                    'id': storypin.id,
                    'title': storypin.title,
                    'content': storypin.content,
                    'media': storypin.media,
                    'the_geom': storypin.the_geom,
                    'start_time': storypin.start_time,
                    'end_time': storypin.end_time,
                    'in_timeline': storypin.in_timeline,
                    'in_map': storypin.in_map,
                    'appearance': storypin.appearance,
                    'auto_show': storypin.auto_show,
                    'pause_playback': storypin.pause_playback,
                    'auto_play': storypin.auto_play,
                    'offset': storypin.offset,
                    'play_length': storypin.play_length
                }
                storypin_list.append(storypin_dict)

            storyframes = chapter.storyframe_set.all()
            storyframe_list = []
            for storyframe in storyframes:
                storyframe_dict = {
                    'id': storyframe.id,
                    'title': storyframe.title,
                    'description': storyframe.description,
                    'the_geom': storyframe.the_geom,
                    'start_time': storyframe.start_time,
                    'end_time': storyframe.end_time,
                    'data': storyframe.data,
                    'center': storyframe.center,
                    'interval': storyframe.interval,
                    'intervalRate': storyframe.intervalRate,
                    'playback': storyframe.playback,
                    'playbackRate': storyframe.playbackRate,
                    'speed': storyframe.speed,
                    'zoom': storyframe.zoom,
                    'layers': storyframe.layers,
                    'resolution': storyframe.resolution
                }
                storyframe_list.append(storyframe_dict)

            chapter_dict = {
                'story_id': self.id,
                'map_id': chapter.id,
                'chapter_index': chapter.chapter_index,
                'title': chapter.title,
                'abstract': chapter.abstract,
                'layers': chapter.layers,
                'layers_config': chapter.layers_config,
                'storyframes': storyframe_list,
                'storypins': storypin_list
            }
            chapter_list.append(chapter_dict)
        return chapter_list

    def update_from_viewer(self, conf):

        if isinstance(conf, str):
            conf = json.loads(conf)

        self.title = conf['about']['title']
        self.abstract = conf['about']['abstract']
        self.is_published = conf['isPublished']
        # Ensure that the slug is unique.
        try:
            instance = MapStory.objects.get(slug=slugify(self.title))
            if instance.id == self.id:
                self.slug = slugify(self.title)
            else:
                self.slug = slugify(self.title) + '-' + str(self.id)
        except MapStory.DoesNotExist:
            self.slug = slugify(self.title)

        if conf['about']['category'] is not None:
            if isinstance(conf['about']['category'], dict):
                categoryID = conf['about']['category']['id']
            else:
                categoryID = conf['about']['category']

            self.category = geonode.base.models.TopicCategory(categoryID)

        if self.uuid is None or self.uuid == '':
            self.uuid = str(uuid.uuid1())

        removed_chapter_ids = conf['removedChapters']
        if removed_chapter_ids is not None and len(removed_chapter_ids) > 0:
            for chapter_id in removed_chapter_ids:
                map_obj = Map.objects.get(id=chapter_id)
                self.chapter_list.remove(map_obj)

        #self.keywords.add(*conf['map'].get('keywords', []))
        self.save()

    def get_absolute_url(self):
        return '/story/' + str(self.slug) + '/'

    def viewer_json(self, user, access_token=None):
        about = {
            'title': self.title,
            'abstract': self.abstract,
            'owner': self.owner.name_long,
            'username': self.owner.username,
            'categoryID': self.category.id if self.category is not None else None
        }

        config = {
            'id': self.id,
            'about': about,
            'chapters': [chapter.viewer_json(user) for chapter in self.chapters],
            'thumbnail_url': settings.MISSING_THUMBNAIL
        }

        return config

    def update_thumbnail(self, first_chapter_obj):
        if first_chapter_obj.chapter_index != 0:
            return

        chapter_base = geonode.base.models.ResourceBase.objects.get(
            id=first_chapter_obj.id)
        geonode.base.models.ResourceBase.objects.filter(id=self.id).update(
            thumbnail_url=chapter_base.thumbnail_url
        )

    @property
    def class_name(self):
        return self.__class__.__name__

    distribution_url_help_text = _(
        'information about on-line sources from which the dataset, specification, or '
        'community profile name and extended metadata elements can be obtained')
    distribution_description_help_text = _(
        'detailed text description of what the online resource is/does')
    distribution_url = db.models.TextField(
        _('distribution URL'),
        blank=True,
        null=True,
        help_text=distribution_url_help_text)
    distribution_description = db.models.TextField(
        _('distribution description'),
        blank=True,
        null=True,
        help_text=distribution_description_help_text)
    slug = db.models.SlugField(max_length=160, null=True, unique=True)

    class Meta(geonode.base.models.ResourceBase.Meta):
        verbose_name_plural = 'MapStories'
        db_table = 'maps_mapstory'


# Redefining Map Model and adding additional fields
class Map(geonode.maps.models.Map):
    story = db.models.ForeignKey(
        MapStory, related_name='chapter_list', blank=True, null=True, on_delete=models.CASCADE)

    chapter_index = db.models.IntegerField(
        _('chapter index'), null=True, blank=True)
    viewer_playbackmode = db.models.CharField(
        _('Viewer Playback'), max_length=32, blank=True, null=True)
    layers_config = db.models.TextField(null=True, blank=True)

    def update_from_viewer(self, conf):

        if isinstance(conf, str):
            conf = json.loads(conf)

        # super allows us to call base class function implementation from geonode
        super(Map, self).update_from_viewer(conf, context={})

        self.viewer_playbackmode = conf['viewerPlaybackMode'] or 'Instant'

        self.chapter_index = conf.get('index')
        story_id = conf.get('storyID', 0)
        story_obj = MapStory.objects.get(id=story_id)
        self.layers_config = json.dumps(conf["layers"])
        self.story = story_obj
        self.save()

    def viewer_json(self, user, access_token=None, *added_layers):
        base_config = super(Map, self).viewer_json(
            user, *added_layers)
        base_config['viewer_playbackmode'] = self.viewer_playbackmode
        base_config['tools'] = [{'outputConfig': {
            'playbackMode': self.viewer_playbackmode}, 'ptype': 'gxp_playback'}]

        return base_config


def mapstory_map_post_save(instance, sender, **kwargs):
    # Call basic post save map functionality from geonode
    geonode.geoserver.signals.geoserver_post_save_map(
        instance, sender, **kwargs)

    # Assuming map thumbnail was created successfully, updating Story object here
    if instance.chapter_index == 0:
        instance.story.update_thumbnail(instance)

    try:
        search.utils.update_es_index(
            MapStory, MapStory.objects.get(id=instance.story.id))
    except:
        pass


def default_is_published(sender, **kwargs):
    """
    GeoNode's resourcebase model defaults is_published to True; override this
    so that new MapStory/Map objects are not published by default.
    """
    instance = kwargs['instance']
    if instance.id is None:  # only reset default when object is first created
        instance.is_published = False


class StoryFrameManager(models.Manager):

    def copy_map_story_frames(self, source_id, target):
        source = Map.objects.get(id=source_id)
        copies = []

        for storyframe in source.storyframe_set.all():
            storyframe.map = target
            storyframe.pk = None
            copies.append(storyframe)

        StoryFrame.objects.bulk_create(copies)


class StoryFrame(models.Model):
    objects = StoryFrameManager()

    PLAYBACK_RATE = (('seconds', 'Seconds'), ('minutes', 'Minutes'),)
    INTERVAL_RATE = (('minutes', 'Minutes'), ('hours', 'Hours'),
                     ('weeks', 'Weeks'), ('months', 'Months'), ('years', 'Years'),)

    map = models.ForeignKey(Map, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    the_geom = models.TextField(blank=True, null=True)
    start_time = models.BigIntegerField(blank=True, null=True)
    end_time = models.BigIntegerField(blank=True, null=True)
    data = models.TextField(blank=True, null=True)
    center = models.TextField(blank=True, null=True)
    interval = models.IntegerField(blank=True, null=True)
    intervalRate = models.CharField(
        max_length=10, choices=INTERVAL_RATE, blank=True, null=True)
    playback = models.IntegerField(blank=True, null=True)
    playbackRate = models.CharField(
        max_length=10, choices=PLAYBACK_RATE, blank=True, null=True)
    speed = models.TextField(blank=True, null=True)
    zoom = models.IntegerField(blank=True, null=True)
    layers = models.TextField(blank=True, null=True)
    resolution = models.TextField(blank=True, null=True)

    def _timefmt(self, val):
        return datetime.isoformat(datetime.utcfromtimestamp(val))

    def set_start(self, val):
        self.start_time = parse_date_time(val)

    def set_end(self, val):
        self.end_time = parse_date_time(val)

    @property
    def start_time_str(self):
        return self._timefmt(self.start_time) if self.start_time else ''

    @property
    def end_time_str(self):
        return self._timefmt(self.end_time) if self.end_time else ''

    class Meta:
        verbose_name_plural = "StoryFrames"


class StoryPinManager(models.Manager):

    def copy_map_storypins(self, source_id, target):
        source = Map.objects.get(id=source_id)
        copies = []
        for ann in source.storypin_set.all():
            ann.map = target
            ann.pk = None
            copies.append(ann)
        StoryPin.objects.bulk_create(copies)


class StoryPin(models.Model):
    objects = StoryPinManager()

    map = models.ForeignKey(Map, on_delete=models.CASCADE)
    title = models.TextField()
    content = models.TextField(blank=True, null=True)
    media = models.TextField(blank=True, null=True)
    the_geom = models.TextField(blank=True, null=True)
    start_time = models.BigIntegerField(blank=True, null=True)
    end_time = models.BigIntegerField(blank=True, null=True)
    in_timeline = models.BooleanField(default=False)
    in_map = models.BooleanField(default=False)
    appearance = models.TextField(blank=True, null=True)
    auto_show = models.BooleanField(default=False)
    pause_playback = models.BooleanField(default=False)
    auto_play = models.BooleanField(default=False)
    offset = models.BigIntegerField(null=True, default=0)
    play_length = models.BigIntegerField(null=True, default=0)

    def _timefmt(self, val):
        return datetime.isoformat(datetime.utcfromtimestamp(val))

    def set_start(self, val):
        self.start_time = parse_date_time(val)

    def set_end(self, val):
        self.end_time = parse_date_time(val)

    @property
    def start_time_str(self):
        return self._timefmt(self.start_time) if self.start_time else ''

    @property
    def end_time_str(self):
        return self._timefmt(self.end_time) if self.end_time else ''

    class Meta:
        verbose_name_plural = "StoryPins"


signals.post_init.connect(default_is_published, sender=MapStory)
signals.post_init.connect(default_is_published, sender=Map)
db.models.signals.post_save.connect(mapstory_map_post_save, sender=Map)


class LayerStyle(models.Model):
    class Meta:
        unique_together = (("style_id", "map_story"),)

    style_id = models.TextField()
    map_story = models.ForeignKey(MapStory, on_delete=models.CASCADE)
    style = models.TextField()
