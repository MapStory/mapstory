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

            annotations = chapter.annotation_set.all()
            pin_list = []
            for annotation in annotations:
                pin_dict = {
                    'title': annotation.title,
                    'content': annotation.content,
                    'media': annotation.media,
                    'the_geom': annotation.the_geom,
                    'start_time': annotation.start_time,
                    'end_time': annotation.end_time,
                    'in_timeline': annotation.in_timeline,
                    'in_map': annotation.in_map,
                    'appearance': annotation.appearance,
                    'auto_show': annotation.auto_show,
                    'pause_playback': annotation.pause_playback
                }
                pin_list.append(pin_dict)

            boxes = chapter.storybox_set.all()
            box_list = []
            for box in boxes:
                box_dict = {
                    'title': box.title,
                    'description': box.description,
                    'the_geom': box.the_geom,
                    'start_time': box.start_time,
                    'end_time': box.end_time,
                    'data': box.data,
                    'center': box.center,
                    'interval': box.interval,
                    'intervalRate': box.intervalRate,
                    'playback': box.playback,
                    'playbackRate': box.playbackRate,
                    'speed': box.speed,
                    'zoom': box.zoom,
                    'layers': box.layers,
                    'resolution': box.resolution
                }
                box_list.append(box_dict)

            chapter_dict = {
                'story_id': self.id,
                'map_id': chapter.id,
                'title': chapter.title,
                'abstract': chapter.abstract,
                'layers': chapter.layers,
                'storyframes': box_list,
                'storypins': pin_list
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

        self.chapter_index = conf['id']
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
