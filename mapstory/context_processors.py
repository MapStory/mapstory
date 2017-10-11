import json

from django.conf import settings
from django.contrib.sites.models import Site

from .context_processors_favorite import get_favorite_info

from mapstory.version import get_version


def context(req):
    default_config = getattr(settings, 'DEFAULT_IMPORTER_CONFIG')
    append_config = getattr(settings, 'DEFAULT_APPEND_CONFIG')
    return dict(
        AUTOCOMPLETE_QUICK_SEARCH=getattr(settings, 'AUTOCOMPLETE_QUICK_SEARCH', False),
        ENABLE_SOCIAL_LOGIN=getattr(settings, 'ENABLE_SOCIAL_LOGIN', False),
        FEATURE_MULTIPLE_STORY_CHAPTERS=getattr(settings, 'FEATURE_MULTIPLE_STORY_CHAPTERS', False),
        GOOGLE_ANALYTICS=getattr(settings, 'GOOGLE_ANALYTICS', None),
        THEME=getattr(settings, 'THEME', 'default'),
        USER_SNAP=getattr(settings, 'USER_SNAP', False),
        VERSION=get_version(),
        default_append_config=json.dumps(append_config),
        default_layer_config=json.dumps(default_config),
        favorite_info=get_favorite_info(req),
        site=Site.objects.get_current()
    )
