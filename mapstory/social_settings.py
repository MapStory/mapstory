from django.db.models import Q

from geonode.people.models import Profile
from mailer import send_html_mail

from mapstory.apps.flag.signals import content_flagged


def flag_handler(flagged_instance, flagged_content, **kw):
    from django.conf import settings  # circular deps
    target = flagged_content.content_object
    # Does this need to be our custom user?
    has_email = Profile.objects.exclude(email='').exclude(email__isnull=True)
    q = Q(is_superuser=True)
    if flagged_instance.flag_type == 'inappropriate':
        q = q | Q(groups__name='content_moderator')
    if flagged_instance.flag_type == 'broken':
        q = q | Q(groups__name='dev_moderator')
    recps = has_email.filter(q)
    if recps.count() == 0:
        # What do we do here?
        # _logger.warning('No recipients for flag')
        return
    link = settings.SITEURL + 'admin/flag/flaginstance/%s' % flagged_instance.pk
    message = loader.render_to_string("flag/email.txt", {
        'flag': flagged_instance,
        'url': link,
        'display': '%s[%s]' % (target._meta.object_name, target.id)
    })
    send_html_mail("[MapStory] Notification",
                   message=message,
                   message_html=message,
                   from_email="do-not-reply@mapstory.org",
                   recipient_list=[u.email for u in recps])

content_flagged.connect(flag_handler)
