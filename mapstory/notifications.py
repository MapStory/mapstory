import json

import geonode
import geonode.contrib.favorite.models
from mapstory.maps.models import Map, MapStory
from django import contrib, db, http, views
from mapstory.apps import flag

from agon_ratings.models import Rating
from django.contrib.auth.decorators import login_required
from django.db.models import signals
from django.http import HttpResponse
from django.views.decorators.http import require_POST
from geonode.tasks.email import send_queued_notifications
from mapstory.apps.flag.models import FlagInstance
from notification import models as notification
from notification.models import NoticeSetting, NoticeType, NOTICE_MEDIA
from threadedcomments.models import ThreadedComment
from user_messages.models import Message

PROFILE_NOTICE_SETTINGS = ['layer_comment', 'layer_rated', 'layer_favorited', 'layer_flagged',
    'layer_downloaded', 'layer_used', 'map_comment', 'map_rated', 'map_favorited',
    'map_flagged', 'map_featured', 'message_received', 'journal_comment', 'password_updated'] 


def send_notification(notice_type_label, user, extra_content=None):
    send = None
    try:
        send = user.noticesetting_set.get(notice_type__label=notice_type_label).send
    except:
        pass

    if send:
        notification.send([user], notice_type_label, {"extra_content": extra_content})
        send_queued_notifications.delay()

def post_save_flag(instance, sender, **kwargs):
    notice_type_label = '%s_flagged' % instance.flagged_content.content_type.name
    extra_content = {
        'instance': instance,
        'sender': instance.user
    }
    send_notification(notice_type_label, instance.flagged_content.content_object.owner, extra_content=extra_content)


def favorite_post_save(instance, sender, **kwargs):
    notice_type_label = '%s_favorited' % instance.content_object.class_name.lower()
    extra_content = {
        'instance': instance,
        'sender': instance.user
    }
    send_notification(notice_type_label, instance.content_object.owner, extra_content=extra_content)
    send_queued_notifications.delay()


def comment_post_save(instance, sender, **kwargs):
    from apps.journal.models import JournalEntry
    if isinstance(instance.content_object, JournalEntry):
        author = instance.content_object.author
        notice_type_label = 'journal_comment'
        extra_content = {
            'instance': instance,
            'sender': instance.user
        }
        send_notification(notice_type_label, author, extra_content=extra_content)
        send_queued_notifications.delay()

    elif isinstance(instance.content_object, geonode.layers.models.Layer) or isinstance(instance.content_object, models.Map):
        author = instance.content_object.owner
        notice_type_label = '%s_comment' % instance.content_object.class_name.lower()
        extra_content = {
            'instance': instance,
            'sender': instance.user
        }
        send_notification(notice_type_label, author, extra_content=extra_content)
        send_queued_notifications.delay()


def post_save_message(instance, sender, **kwargs):
    send_notification('message_received', instance.thread.users.first(), extra_content={'instance': instance})
    send_queued_notifications.delay()


def pre_save_map(instance, sender, **kwargs):
    """
    Signal used to send notification for when a layer is used in someone else mapstory
    """

    if instance.id:
        # not a new map
        if Map.objects.filter(id=instance.id).exists():
            existing_layers = Map.objects.get(id=instance.id).local_layers
            new_layers = instance.local_layers
            added_layers = new_layers.exclude(id__in=existing_layers)
            for layer in added_layers:
                if instance.owner != layer.owner:
                    extra_content = {
                        'used_in': instance,
                        'layer': layer
                    }
                    send_notification('layer_used', layer.owner, extra_content=extra_content)
    else:
        for layer in instance.local_layers:
            if instance.owner != layer.owner:
                extra_content = {
                        'used_in': instance,
                        'layer': layer
                }
                send_notification('layer_used', layer.owner, extra_content=extra_content)


def post_save_mapstory(instance, sender, **kwargs):
    if instance.featured:
        send_notification('map_featured', instance.owner, extra_content={'instance': instance})


def post_save_profile(instance, sender, created, **kwargs):
    """
    On new profile, remove all notifications and set only the needed,
    on profile update check if the password is changed and notify the user
    """
    if created:
        for notice in NoticeType.objects.filter(label__in=PROFILE_NOTICE_SETTINGS):
                NoticeSetting.for_user(instance, notice, NOTICE_MEDIA[0][0])
        NoticeSetting.objects.filter(user=instance).exclude(notice_type__label__in=[
            'password_updated',
            'message_received']).update(send=False)


def pre_save_profile(instance, sender, **kwargs):
    if geonode.people.models.Profile.objects.filter(id=instance.id).exists():
        cur_pwd = geonode.people.models.Profile.objects.get(id=instance.id).password
        if instance.password != cur_pwd:
            send_notification('password_updated', instance)

def post_save_rating(instance, sender, **kwargs):
    author = instance.content_object.owner
    notice_type_label = '%s_rated' % instance.content_object.class_name.lower()
    extra_content = {
        'instance': instance,
        'sender': instance.user
    }
    send_notification(notice_type_label, author, extra_content=extra_content)
    send_queued_notifications.delay()

def set_mapstory_notifications():
    signals.post_save.connect(comment_post_save, sender=ThreadedComment)
    signals.post_save.connect(favorite_post_save, sender=geonode.contrib.favorite.models.Favorite)
    signals.post_save.connect(post_save_flag, sender=FlagInstance)
    signals.post_save.connect(post_save_message, sender=Message)
    signals.pre_save.connect(pre_save_map, sender=Map)
    signals.post_save.connect(post_save_mapstory, sender=MapStory)
    signals.pre_save.connect(pre_save_profile, sender=geonode.people.models.Profile)
    signals.post_save.connect(post_save_profile, sender=geonode.people.models.Profile)
    signals.post_save.connect(post_save_rating, sender=Rating)


@login_required
@require_POST
def notify_download(request):
    extension = request.POST.get('extension', None)
    id = request.POST.get('id', None)

    if extension and id:
        layer = geonode.layers.models.Layer.objects.get(id=id)
        owner = layer.owner
        if request.user != owner:
            extra_content = {
                'instance': layer,
                'requester': request.user,
                'requested_format': extension
            }
            send_notification('layer_downloaded', owner, extra_content=extra_content)
        return HttpResponse('notification sent')
    else:
        return HttpResponse(status=404)


@login_required
@require_POST
def set_profile_notification(request, username):
    if username == request.user.username:
        notice_type = request.POST.get('notice_type', None)
        if notice_type:
            notice = NoticeType.objects.get(label=notice_type)
            setting = NoticeSetting.for_user(request.user, notice, NOTICE_MEDIA[0][0])
            setting.send = json.loads(request.POST.get('send', True))
            setting.save()
            return HttpResponse('Ok')

    else:
        return HttpResponseForbidden(
            'You are not allowed to edit other users profile')
