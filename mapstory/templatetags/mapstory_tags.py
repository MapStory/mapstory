from django import template
from django.conf import settings

register = template.Library()

@register.simple_tag
def remote_content(path):
    return '%s/%s' % (settings.REMOTE_CONTENT_URL, path)
