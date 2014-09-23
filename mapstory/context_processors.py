from django.conf import settings


LIVE_RELOAD = getattr(settings, 'LIVE_RELOAD', False)
if LIVE_RELOAD is True:
    LIVE_RELOAD = 'localhost'

_context = dict(
    LIVE_RELOAD=LIVE_RELOAD
)

def context(req):
    return _context