import geonode
import haystack


class LayerIndex(geonode.layers.search_indexes.LayerIndex):
    # Need to grab the owner's first and last name as well as published status
    owner__first_name = haystack.indexes.CharField(model_attr="owner__first_name", faceted=True, null=True)
    owner__last_name = haystack.indexes.CharField(model_attr="owner__last_name", faceted=True, null=True)
    is_published = haystack.indexes.BooleanField(model_attr="is_published")
    # Featured status for front page carousel
    featured = haystack.indexes.BooleanField(model_attr="featured")
