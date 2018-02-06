from django.db import models
from mapstory.mapstories.models import Map
from mapstory.apps.storyframes.utils import parse_date_time
from datetime import datetime
from django.contrib.gis.db import models as gis


class StoryFrameManager(models.Manager):

    def copy_map_story_frames(self, source_id, target):
        source = Map.objects.get(id=source_id)
        copies = []
        print('copy from', source_id, source.storyframe_set.all())
        print('to target', target.id)
        for storyframe in source.storyframe_set.all():
            storyframe.map = target
            storyframe.pk = None
            copies.append(storyframe)
        print(copies)
        StoryFrame.objects.bulk_create(copies)


class StoryFrame(models.Model):
    objects = StoryFrameManager()

    PLAYBACK_RATE = (('seconds', 'Seconds'),('minutes', 'Minutes'),)
    INTERVAL_RATE = (('minutes', 'Minutes'),('hours', 'Hours'),
                     ('weeks', 'Weeks'),('months', 'Months'),('years', 'Years'),)

    map = models.ForeignKey(Map)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    the_geom = models.TextField(blank=True, null=True)
    start_time = models.BigIntegerField(blank=True, null=True)
    end_time = models.BigIntegerField(blank=True, null=True)
    data = models.TextField(blank=True, null=True)
    center = models.TextField(blank=True, null=True)
    interval = models.IntegerField(blank=True, null=True)
    intervalRate = models.CharField(max_length=10, choices=INTERVAL_RATE, blank=True, null=True)
    playback = models.IntegerField(blank=True, null=True)
    playbackRate = models.CharField(max_length=10, choices=PLAYBACK_RATE, blank=True, null=True)
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
        verbose_name_plural = "StoryFrame"


def map_copied(sender, source_id, **kw):
    try:
        StoryFrame.objects.copy_map_story_frames(source_id, sender)
    except:
        import traceback
        traceback.print_exc()
