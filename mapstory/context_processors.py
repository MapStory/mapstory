from django.conf import settings

from .context_processors_favorite import get_favorite_info

LIVE_RELOAD = getattr(settings, 'LIVE_RELOAD', False)
if LIVE_RELOAD is True:
    LIVE_RELOAD = 'localhost'


def context(req):
    return dict(
        LIVE_RELOAD=LIVE_RELOAD,
        favorite_info=get_favorite_info(req),
    )
