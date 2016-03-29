from django.conf import settings

from .context_processors_favorite import get_favorite_info


def context(req):
    return dict(
        AUTOCOMPLETE_QUICK_SEARCH=getattr(settings, 'AUTOCOMPLETE_QUICK_SEARCH', False),
        favorite_info=get_favorite_info(req),
        GOOGLE_ANALYTICS=getattr(settings, 'GOOGLE_ANALYTICS', None),
        ENABLE_SOCIAL_LOGIN=getattr(settings, 'ENABLE_SOCIAL_LOGIN', False),
        USER_SNAP=getattr(settings, 'USER_SNAP', False)
    )
