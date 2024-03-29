from django.contrib.contenttypes.models import ContentType
from django.db.models import Avg

from pinax.ratings.models import OverallRating
from dialogos.models import Comment
from haystack import indexes
from mapstory.mapstories.models import MapStory


class MapStoryIndex(indexes.SearchIndex, indexes.Indexable):
    id = indexes.IntegerField(model_attr='id')
    abstract = indexes.CharField(model_attr="abstract", boost=1.5)
    category__gn_description = indexes.CharField(
        model_attr="category__gn_description", null=True)
    distribution_description = indexes.CharField(
        model_attr="distribution_description", null=True)
    distribution_url = indexes.CharField(
        model_attr="distribution_url", null=True)
    owner__username = indexes.CharField(
        model_attr="owner", faceted=True, null=True)
    popular_count = indexes.IntegerField(
        model_attr="popular_count",
        default=0,
        boost=20)
    share_count = indexes.IntegerField(model_attr="share_count", default=0)
    rating = indexes.IntegerField(null=True)
    thumbnail_url = indexes.CharField(model_attr="thumbnail_url", null=True)
    detail_url = indexes.CharField(model_attr="detail_url", null=True)
    uuid = indexes.CharField(model_attr="uuid")
    title = indexes.CharField(model_attr="title", boost=2)
    date = indexes.DateTimeField(model_attr="date")
    text = indexes.EdgeNgramField(
        document=True, use_template=True, stored=False)
    type = indexes.CharField(faceted=True)
    title_sortable = indexes.CharField(
        indexed=False, stored=False)  # Necessary for sorting
    category = indexes.CharField(
        model_attr="category__identifier",
        faceted=True,
        null=True,
        stored=True)
    bbox_left = indexes.FloatField(
        model_attr="bbox_x0", null=True, stored=False)
    bbox_right = indexes.FloatField(
        model_attr="bbox_x1", null=True, stored=False)
    bbox_bottom = indexes.FloatField(
        model_attr="bbox_y0", null=True, stored=False)
    bbox_top = indexes.FloatField(
        model_attr="bbox_y1", null=True, stored=False)
    temporal_extent_start = indexes.DateTimeField(
        model_attr="temporal_extent_start",
        null=True,
        stored=False)
    temporal_extent_end = indexes.DateTimeField(
        model_attr="temporal_extent_end",
        null=True,
        stored=False)
    keywords = indexes.MultiValueField(
        model_attr="keyword_slug_list",
        null=True,
        faceted=True,
        stored=True)
    regions = indexes.MultiValueField(
        model_attr="region_name_list",
        null=True,
        faceted=True,
        stored=True)
    popular_count = indexes.IntegerField(
        model_attr="popular_count",
        default=0,
        boost=20)
    share_count = indexes.IntegerField(model_attr="share_count", default=0)
    rating = indexes.IntegerField(null=True)
    num_ratings = indexes.IntegerField(stored=False)
    num_comments = indexes.IntegerField(stored=False)
    # Need to grab the owner's first and last name as well as published status
    owner__first_name = indexes.CharField(
        model_attr="owner__first_name", faceted=True, null=True)
    owner__last_name = indexes.CharField(
        model_attr="owner__last_name", faceted=True, null=True)
    is_published = indexes.BooleanField(model_attr="is_published")
    # Featured status for front page carousel
    featured = indexes.BooleanField(model_attr="featured")

    def get_model(self):
        return MapStory

    def prepare_type(self, obj):
        return "mapstory"

    def prepare_rating(self, obj):
        ct = ContentType.objects.get_for_model(obj)
        try:
            rating = OverallRating.objects.filter(
                object_id=obj.pk,
                content_type=ct
            ).aggregate(r=Avg("rating"))["r"]
            return float(str(rating or "0"))
        except OverallRating.DoesNotExist:
            return 0.0

    def prepare_num_ratings(self, obj):
        ct = ContentType.objects.get_for_model(obj)
        try:
            return OverallRating.objects.filter(
                object_id=obj.pk,
                content_type=ct
            ).all().count()
        except OverallRating.DoesNotExist:
            return 0

    def prepare_num_comments(self, obj):
        try:
            return Comment.objects.filter(
                object_id=obj.pk,
                content_type=ContentType.objects.get_for_model(obj)
            ).all().count()
        except:
            return 0

    def prepare_title_sortable(self, obj):
        return obj.title.lower()
