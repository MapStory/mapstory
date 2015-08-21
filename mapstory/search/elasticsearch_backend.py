from haystack.backends.elasticsearch_backend import ElasticsearchSearchBackend, BaseEngine, ElasticsearchSearchQuery
from haystack.exceptions import MissingDependency
from haystack.utils import get_identifier
from geonode.base.models import ResourceBase

try:
    import elasticsearch
    from elasticsearch.helpers import bulk_index
    from elasticsearch.exceptions import NotFoundError
except ImportError:
    raise MissingDependency("The 'elasticsearch' backend requires the installation of 'elasticsearch'. Please refer to the documentation.")


class MapStoryElasticSearchBackend(ElasticsearchSearchBackend):
    """
    ElasticSearchBackend overrides.
    """

    def remove(self, obj_or_string, commit=True):
        doc_id = get_identifier(obj_or_string)

        # django-haystack default to using namespaced ids for objects like layers.layer.83 but the GeoNode SearchIndexes
        # override the default ids with ResourceBase ids.
        if isinstance(obj_or_string, ResourceBase):
            doc_id = getattr(obj_or_string, 'id')

        if not self.setup_complete:
            try:
                self.setup()
            except elasticsearch.TransportError as e:
                if not self.silently_fail:
                    raise

                self.log.error("Failed to remove document '%s' from Elasticsearch: %s", doc_id, e)
                return

        try:
            self.conn.delete(index=self.index_name, doc_type='modelresult', id=doc_id, ignore=404)

            if commit:
                self.conn.indices.refresh(index=self.index_name)
        except elasticsearch.TransportError as e:
            if not self.silently_fail:
                raise

            self.log.error("Failed to remove document '%s' from Elasticsearch: %s", doc_id, e)


class MapStoryElasticsearchSearchEngine(BaseEngine):
    """
    Custom MapStory search engine.
    """
    backend = MapStoryElasticSearchBackend
    query = ElasticsearchSearchQuery
