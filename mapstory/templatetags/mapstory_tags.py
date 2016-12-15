from django import template
from django.contrib.sites.models import Site
from django.conf import settings
from mapstory.utils import Link
import json
register = template.Library()

@register.simple_tag
def remote_content(path):
    return '%s/%s' % (settings.REMOTE_CONTENT_URL, path)

@register.simple_tag
def link(href, name, width=None, height=None, css_class=None):
    return Link(href, name).render(width, height, css_class)

@register.filter
def by_name(objects, name):
    return objects.filter(name__iexact=name).first()

@register.filter
def to_json(data):
    return json.dumps(data)

@register.simple_tag
def current_domain():
    return Site.objects.get_current()
