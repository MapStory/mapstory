from actstream import action
from icon_commons.models import Icon

from django.db.models import signals


def post_save_mapstory_actstream_handler(sender, instance, created, **kwargs):
    actor = getattr(instance, "owner", None)
    action.send(actor, verb='created', action_object=instance, target=instance)


def post_save_icon_actstream_handler(sender, instance, created, **kwargs):
    if created:
        actor = getattr(instance, "owner", None)
        action.send(actor, verb='uploaded an Icon')


signals.post_save.connect(
    post_save_icon_actstream_handler,
    sender=Icon,
    dispatch_uid='mapstory.apps.activities.social.icon'
)
