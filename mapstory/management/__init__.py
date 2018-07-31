from django.conf import settings
from django.apps import apps
from django.db.models import signals
from django.utils.translation import ugettext_noop as _
import logging

logger = logging.getLogger(__name__)
