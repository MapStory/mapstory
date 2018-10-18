import haystack
from mapstory.search.signals import BaseSignalProcessor


def update_es_index(sender, instance):
    """
    Manually update an elastic search index.
    """
    b = BaseSignalProcessor(haystack.connections, haystack.connection_router)
    b.handle_save(sender, instance)
