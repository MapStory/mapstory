from django.db import models

from datetime import datetime

from mapstory.storypins.utils import parse_date_time
from mapstory.mapstories.models import Map


class StoryPinManager(models.Manager):

    def copy_map_storypins(self, source_id, target):
        source = Map.objects.get(id=source_id)
        copies = []
        print 'copy from', source_id, source.storypin_set.all()
        print 'to target', target.id
        for ann in source.storypin_set.all():
            ann.map = target
            ann.pk = None
            copies.append(ann)
        print copies
        StoryPin.objects.bulk_create(copies)
        print 'yeah'


class StoryPin(models.Model):
    objects = StoryPinManager()

    map = models.ForeignKey(Map)
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


def map_copied(sender, source_id, **kw):
    try:
        StoryPin.objects.copy_map_storypins(source_id, sender)
    except:
        print 'dammit jim'
        import traceback
        traceback.print_exc()
