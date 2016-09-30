from django.conf import settings

from .context_processors_favorite import get_favorite_info
from django.contrib.sites.models import Site

import json


def context(req):
    default_config = getattr(settings,'DEFAULT_IMPORTER_CONFIG')
    append_config = getattr(settings,'DEFAULT_APPEND_CONFIG')
    return dict(
        AUTOCOMPLETE_QUICK_SEARCH=getattr(settings, 'AUTOCOMPLETE_QUICK_SEARCH', False),
        favorite_info=get_favorite_info(req),
        GOOGLE_ANALYTICS=getattr(settings, 'GOOGLE_ANALYTICS', None),
        ENABLE_SOCIAL_LOGIN=getattr(settings, 'ENABLE_SOCIAL_LOGIN', False),
        USER_SNAP=getattr(settings, 'USER_SNAP', False),
        site=Site.objects.get_current(),
        THEME=getattr(settings, 'THEME', 'default'),
        default_layer_config=json.dumps(default_config),
        default_append_config=json.dumps(append_config)
    )