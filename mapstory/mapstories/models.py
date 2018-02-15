import geonode
import json
import uuid

from django import core, db
from django.db.models import signals
from django.template.defaultfilters import slugify
from django.utils.translation import ugettext_lazy as _
# Redefining Map Model and adding additional fields


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
                    'pause_playback': storypin.pause_playback
                }
                storypin_list.append(storypin_dict)

            storyframes = chapter.storyframe_set.all()
            storyframe_list = []
            for storyframe in storyframes:
                storyframe_dict = {
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
                'title': chapter.title,
                'abstract': chapter.abstract,
                'layers': chapter.layers,
                'storyframes': storyframe_list,
                'storypins': storypin_list
            }
            chapter_list.append(chapter_dict)
        return chapter_list

    def update_from_viewer(self, conf):

        if isinstance(conf, basestring):
            conf = json.loads(conf)

        self.title = conf['title']
        self.abstract = conf['abstract']
        self.is_published = conf['is_published']
        # Ensure that the slug is unique.
        try:
            instance = MapStory.objects.get(slug=slugify(conf['title']))
            if instance.id == self.id:
                self.slug = slugify(conf['title'])
            else:
                self.slug = slugify(conf['title']) + '-' + str(self.id)
        except MapStory.DoesNotExist:
            self.slug = slugify(conf['title'])

        if conf['category'] is not None:
            self.category = geonode.base.models.TopicCategory(conf['category'])

        if self.uuid is None or self.uuid == '':
            self.uuid = str(uuid.uuid1())

        removed_chapter_ids = conf['removed_chapters']
        if removed_chapter_ids is not None and len(removed_chapter_ids) > 0:
            for chapter_id in removed_chapter_ids:
                map_obj = Map.objects.get(id=chapter_id)
                self.chapter_list.remove(map_obj)

        #self.keywords.add(*conf['map'].get('keywords', []))
        self.save()

    def get_absolute_url(self):
        return '/story/' + str(self.slug) + '/'

    def viewer_json(self, user):
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
            'thumbnail_url': '/static/geonode/img/missing_thumb.png'
        }

        return config

    def update_thumbnail(self, first_chapter_obj):
        if first_chapter_obj.chapter_index != 0:
            return

        chapter_base = geonode.base.models.ResourceBase.objects.get(id=first_chapter_obj.id)
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
        pass


class Map(geonode.maps.models.Map):
    story = db.models.ForeignKey(MapStory, related_name='chapter_list', blank=True, null=True)

    chapter_index = db.models.IntegerField(_('chapter index'), null=True, blank=True)
    viewer_playbackmode = db.models.CharField(_('Viewer Playback'), max_length=32, blank=True, null=True)

    def update_from_viewer(self, conf):

        if isinstance(conf, basestring):
            conf = json.loads(conf)

        #super allows us to call base class function implementation from geonode
        super(Map, self).update_from_viewer(conf)

        self.viewer_playbackmode = conf['viewer_playbackmode'] or 'Instant'

        self.chapter_index = conf['chapter_index']
        story_id = conf.get('story_id', 0)
        story_obj = MapStory.objects.get(id=story_id)
        self.story = story_obj
        self.save()

    def viewer_json(self, user, *added_layers):
        access_token = None
        base_config = super(Map, self).viewer_json(user, access_token, *added_layers)
        base_config['viewer_playbackmode'] = self.viewer_playbackmode
        base_config['tools'] = [{'outputConfig': {'playbackMode': self.viewer_playbackmode}, 'ptype': 'gxp_playback'}]

        return base_config


def default_is_published(sender, **kwargs):
    """
    GeoNode's resourcebase model defaults is_published to True; override this
    so that new MapStory/Map objects are not published by default.
    """
    instance = kwargs["instance"]
    if instance.id is None:  # only reset default when object is first created
        instance.is_published = False

signals.post_init.connect(default_is_published, sender=MapStory)
signals.post_init.connect(default_is_published, sender=Map)
