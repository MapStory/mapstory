from django.conf import settings

from .context_processors_favorite import get_favorite_info

LIVE_RELOAD = getattr(settings, 'LIVE_RELOAD', False)
if LIVE_RELOAD is True:
    LIVE_RELOAD = 'localhost'

_context = dict(
    LIVE_RELOAD=LIVE_RELOAD,
)


def context(req):
    return dict(
        LIVE_RELOAD=LIVE_RELOAD,
        AUTOCOMPLETE_QUICK_SEARCH=getattr(settings, 'AUTOCOMPLETE_QUICK_SEARCH', False),
        favorite_info=get_favorite_info(req),
        GOOGLE_ANALYTICS=getattr(settings, 'GOOGLE_ANALYTICS', None)
    )
