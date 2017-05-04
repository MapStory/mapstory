from django.conf import settings
from django.apps import apps
from django.db.models import signals
from django.utils.translation import ugettext_noop as _
import logging

logger = logging.getLogger(__name__)

# TODO hacky fix until GeoNode's PR #2911 is available in our pinned version
if "notification" in settings.INSTALLED_APPS:
    import notification

    if hasattr(notification, 'models'):
        def create_notifications(**kwargs):
            notification.models.NoticeType.create(
                "layer_created",
                _("Layer Created"),
                _("A Layer was created"))
            notification.models.NoticeType.create(
                "layer_updated",
                _("Layer Updated"),
                _("A Layer was updated"))
            notification.models.NoticeType.create(
                "layer_deleted",
                _("Layer Deleted"),
                _("A Layer was deleted"))
            notification.models.NoticeType.create(
                "layer_comment",
                _("Comment on Layer"),
                _("A layer was commented on"))
            notification.models.NoticeType.create(
                "layer_rated",
                _("Rating for Layer"),
                _("A rating was given to a layer"))
            notification.models.NoticeType.create(
                "request_download_resourcebase",
                _("Request download to an owner"),
                _("A request has been sent to the owner"))
            notification.models.NoticeType.create(
                "map_created",
                _("Map Created"),
                _("A Map was created"))
            notification.models.NoticeType.create(
                "map_updated",
                _("Map Updated"),
                _("A Map was updated"))
            notification.models.NoticeType.create(
                "map_deleted",
                _("Map Deleted"),
                _("A Map was deleted"))
            notification.models.NoticeType.create(
                "profile_created",
                _("Profile Created"),
                _("A Profile was created"))
            notification.models.NoticeType.create(
                "profile_updated",
                _("Profile Updated"),
                _("A Profile was updated"))
            notification.models.NoticeType.create(
                "profile_deleted",
                _("Profile Deleted"),
                _("A Profile was deleted"))
            notification.models.NoticeType.create(
                "document_created",
                _("Document Created"),
                _("A Document was created"))
            notification.models.NoticeType.create(
                "document_updated",
                _("Document Updated"),
                _("A Document was updated"))
            notification.models.NoticeType.create(
                "document_deleted",
                _("Document Deleted"),
                _("A Document was deleted"))
            notification.models.NoticeType.create(
                "document_comment",
                _("Comment on Document"),
                _("A Document was commented on"))
            notification.models.NoticeType.create(
                "document_rated",
                _("Document for Map"),
                _("A rating was given to a document"))

        signals.post_migrate.connect(
            create_notifications,
            sender=apps.get_app_config('notification'))

    else:
        logger.info(
            "Skipping creation of NoticeTypes since notification app was not found.")
